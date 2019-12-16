// (C) 2007-2018 GoodData Corporation
import React, { Component } from 'react';
import { AttributeFilter, Table, Model } from '@gooddata/react-components';

import '@gooddata/react-components/styles/css/main.css';

import ExampleWithExport from './utils/ExampleWithExport';

import {
    projectId,
    monthDateIdentifier,
    monthDateUri,
    franchiseFeesIdentifier,
    franchiseFeesAdRoyaltyIdentifier,
    franchiseFeesInitialFranchiseFeeIdentifier,
    franchiseFeesIdentifierOngoingRoyalty
} from '../utils/fixtures';


export class TableExportExample extends Component {

    constructor(props) {
        super(props);
        this.onApply = this.onApply.bind(this);
        this.state = {
            filters: [],
            error: null
        };
    }

    onLoadingChanged(...params) {
        // eslint-disable-next-line no-console
        return console.log('TableExportExample onLoadingChanged', ...params);
    }
onApply = (filter) => {
        console.log('AttributeFilterExample filter', filter);

        const isPositive = !!filter.in;
        const elementsProp = isPositive ? 'in' : 'notIn';

        const filters = [{
            [isPositive ? 'positiveAttributeFilter' : 'negativeAttributeFilter']: {
                displayForm: {
                    identifier: filter.id
                },
                [elementsProp]: filter[elementsProp].map(element => (`${monthDateUri}/elements?id=${element}`))
            }
        }];
        
            this.setState({ filters });
        
    }
    filterPositiveAttribute(filter) {
        const filters = [
            {
                positiveAttributeFilter: {
                    displayForm: {
                        identifier: filter.id,
                    },
                    in: filter.in.map(element => `${monthDateUri}/elements?id=${element}`),
                },
            },
        ];
        let error = null;
        if (filter.in.length === 0) {
            error = "The filter must have at least one item selected";
        }
        this.setState({ filters, error });
    }

    filterNegativeAttribute(filter) {
        const filters = [
            {
                negativeAttributeFilter: {
                    displayForm: {
                        identifier: filter.id,
                    },
                    notIn: filter.notIn.map(element => `${monthDateUri}/elements?id=${element}`),
                },
            },
        ];
        this.setState({ filters });
    }
    onError(...params) {
        // eslint-disable-next-line no-console
        return console.log('TableExportExample onError', ...params);
    }

    render() {
        const measures = [
            Model.measure(franchiseFeesIdentifier)
                .format('#,##0')
                .localIdentifier('franchiseFeesIdentifier'),
            Model.measure(franchiseFeesAdRoyaltyIdentifier)
                .format('#,##0')
                .localIdentifier('franchiseFeesAdRoyaltyIdentifier'),
            Model.measure(franchiseFeesInitialFranchiseFeeIdentifier)
                .format('#,##0')
                .localIdentifier('franchiseFeesInitialFranchiseFeeIdentifier'),
            Model.measure(franchiseFeesIdentifierOngoingRoyalty)
                .format('#,##0')
                .localIdentifier('franchiseFeesIdentifierOngoingRoyalty')
        ];

        const totals = [
            {
                measureIdentifier: 'franchiseFeesIdentifier',
                type: 'avg',
                attributeIdentifier: 'month'
            },
            {
                measureIdentifier: 'franchiseFeesAdRoyaltyIdentifier',
                type: 'avg',
                attributeIdentifier: 'month'
            },
            {
                measureIdentifier: 'franchiseFeesInitialFranchiseFeeIdentifier',
                type: 'avg',
                attributeIdentifier: 'month'
            },
            {
                measureIdentifier: 'franchiseFeesIdentifierOngoingRoyalty',
                type: 'avg',
                attributeIdentifier: 'month'
            }
        ];

        const attributes = [
            Model.attribute(monthDateIdentifier).localIdentifier('month')
        ];
        const { filters, error } = this.state;
        return (
            <ExampleWithExport>
                {onExportReady => (
                    <div>
                    <AttributeFilter
                        identifier={monthDateIdentifier}
                        projectId={projectId}
                        fullscreenOnMobile={false}
                        onApply={this.onApply}
                    />
                    <div style={{ height: 300 }} className="s-table">
                        <Table
                            projectId={projectId}
                            measures={measures}
                            attributes={attributes}
                            totals={totals}
                            filters={filters}
                            onExportReady={onExportReady}
                            onLoadingChanged={this.onLoadingChanged}
                            onError={this.onError}
                        />
                    </div>
                    </div>
                )}
            </ExampleWithExport >
        );
    }
}

export default TableExportExample;
