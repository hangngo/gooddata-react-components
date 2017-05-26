import isEmpty = require('lodash/isEmpty');
import compact = require('lodash/compact');
import flow = require('lodash/flow');
import uniq = require('lodash/uniq');
import flatten = require('lodash/flatten');
import pick = require('lodash/pick');
import get = require('lodash/get');
import { ISort, ITransformation } from '../interfaces/Transformation';
import {
    IMeasure,
    IMeasureAttributeFilter,
    ISpecificObject,
    ILookupObject,
    IAfm,
    IDateFilter,
    IAttributeFilter,
    IPositiveFilter,
    INegativeFilter
} from '../interfaces/Afm';

export type ObjectUri = string;

export interface IAttributeMapKeys {
    attribute: ObjectUri;
    attributeDisplayForm: ObjectUri;
}

export type AttributeMap = IAttributeMapKeys[];

const getFilterExpression = (filter: IMeasureAttributeFilter, attributesMapping) => {
    const elements = (filter as IPositiveFilter).in || (filter as INegativeFilter).notIn;

    if (isEmpty(elements)) {
        return null;
    }

    const uri = getAttributeByDisplayForm(attributesMapping, filter.id);
    const inExpr = (filter as INegativeFilter).notIn ? 'NOT IN' : 'IN';
    const elementsForQuery = elements.map((e) => `[${uri}/elements?id=${e}]`);

    return `[${uri}] ${inExpr} (${elementsForQuery.join(',')})`;
};

const getFiltersExpression = (filters: IMeasureAttributeFilter[] = [], attributesMapping) => {
    const filterExpressions = filters.map((filter) => getFilterExpression(filter, attributesMapping));

    return compact(filterExpressions).join(' AND ');
};

const getSimpleMetricExpression = (item: IMeasure, attributesMapping, includeFilters = true) => {
    const { filters, baseObject, aggregation } = item.definition;
    const filterExpression = includeFilters ? getFiltersExpression(filters, attributesMapping) : null;
    const uri = (baseObject as ISpecificObject).id;

    return `${aggregation ? `${aggregation.toUpperCase()}([${uri}])` : `[${uri}]`
        }${filterExpression ? ` WHERE ${filterExpression}` : ''}`;
};

const getGeneratedMetricExpression = (item: IMeasure, attributesMapping, includeFilters = true) => {
    return `SELECT ${getSimpleMetricExpression(item, attributesMapping, includeFilters)}`;
};

const getPercentMetricExpression = (item: IMeasure, attributesMapping, attributesUris) => {
    const metricExpressionWithoutFilters = getGeneratedMetricExpression(item, attributesMapping, false);

    const filterExpression = getFiltersExpression(item.definition.filters, attributesMapping);
    const whereExpression = filterExpression ? ` WHERE ${filterExpression}` : '';

    const byAllExpression = attributesUris.map((attributeUri) => `ALL [${attributeUri}]`).join(',');

    return `SELECT (${metricExpressionWithoutFilters}${whereExpression}) ` +
        `/ (${metricExpressionWithoutFilters} BY ${byAllExpression}${whereExpression})`;
};

const createContributionMetric = (item, attributesMapping, attributesUris) => {
    return getPercentMetricExpression(item, attributesMapping, attributesUris);
};

const createPoPMetric = (item: IMeasure, afm: IAfm, attributesMapping) => {
    const baseObject = (item.definition.baseObject as ILookupObject);
    let generatedMetricExpression;
    if (baseObject.lookupId) {
        const base = afm.measures.find((measure) => measure.id === baseObject.lookupId);
        generatedMetricExpression = `SELECT (${generateMetricDefinition(base, afm, attributesMapping)})`;
    } else {
        generatedMetricExpression = `SELECT ${getSimpleMetricExpression(item, attributesMapping)}`;
    }
    const attributeUri = getAttributeByDisplayForm(attributesMapping, item.definition.popAttribute.id);
    return `${generatedMetricExpression} FOR PREVIOUS ([${attributeUri}])`;
};

const isPoP = (item: IMeasure): boolean => {
    return !!(item.definition && item.definition.popAttribute);
};

const isShowInPercent = (item: IMeasure): boolean => {
    return item.definition && item.definition.showInPercent;
};

const hasFilters = (item: IMeasure): boolean => {
    return !!(item.definition && item.definition.filters);
};

const getAttributeByDisplayForm = (mapping, displayForm): string => {
    return mapping.find((item) => item.attributeDisplayForm === displayForm).attribute;
};

export const generateMetricDefinition = (item: IMeasure, afm: IAfm, attributesMapping) => {
    if (isPoP(item)) {
        return createPoPMetric(item, afm, attributesMapping);
    }

    if (isShowInPercent(item)) {
        const attributesUris = afm.attributes.map(
            (attribute) => getAttributeByDisplayForm(attributesMapping, attribute.id)
        );
        return createContributionMetric(item, attributesMapping, attributesUris);
    }

    return getGeneratedMetricExpression(item, attributesMapping);
};

export const lookupAttributes = (afm: IAfm) => {
    const attributes = afm.measures.map((measure) => {
        const ids = [];
        if (isPoP(measure)) { // MAQL - FOR PREVIOUS ([attributeUri])
            ids.push(measure.definition.popAttribute.id);
        }

        if (isShowInPercent(measure)) { // MAQL - BY ALL [attributeUri1], ALL [attributeUri2]
            ids.push(...afm.attributes.map((attribute) => attribute.id));
        }

        if (hasFilters(measure)) {
            ids.push(...measure.definition.filters.map((filter) => filter.id));
        }

        return ids;
    });

    return flow(
        flatten,
        compact,
        uniq
    )(attributes);
};

export function normalizeAfm(afm: IAfm): IAfm {
    return {
        attributes: afm.attributes || [],
        measures: afm.measures || [],
        filters: afm.filters || []
    };
}

const generateDateFilter = (filter: IDateFilter) => {
    return {
        $between: [...filter.between],
        $granularity: `GDC.time.${filter.granularity}`
    };
};

const generateAttributeFilter = (filter: IAttributeFilter) => {
    return (filter.in) ?
        { $in: filter.in.map((id) => ({ id })) } :
        { $not: { $in: filter.notIn.map((id) => ({ id })) }};
};

export const generateFilters = (afm: IAfm) => {
    return afm.filters.reduce((memo, filter) => {
        if (filter.type === 'date') {
            memo[filter.id] = generateDateFilter(filter as IDateFilter);
        }

        if (filter.type === 'attribute') {
            memo.$and.push({
                [filter.id]: generateAttributeFilter(filter as IAttributeFilter)
            });
        }

        return memo;
    }, { $and: [] });
};

export const getSorting = (transformation): ISort[] => {
    return get(transformation, 'sorting', []);
};

export interface IAdditionalInfo {
    title?: string;
    format?: string;
}

export const getMeasureAdditionalInfo =
    (transformation: ITransformation, id: string): IAdditionalInfo  => {
        const info = get(transformation, 'measures', []).find((measure) => measure.id === id);
        return pick<IAdditionalInfo, {}>(info, ['title', 'format']);
    };