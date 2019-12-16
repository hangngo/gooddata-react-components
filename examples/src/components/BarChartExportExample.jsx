// (C) 2007-2018 GoodData Corporation
import React, { Component } from 'react';
import { AttributeFilter, BarChart, Model } from '@gooddata/react-components';

import '@gooddata/react-components/styles/css/main.css';

import ExampleWithExport from './utils/ExampleWithExport';
import { totalSalesIdentifier, locationResortIdentifier, locationResortUri, projectId } from '../utils/fixtures';

const amount = Model.measure(totalSalesIdentifier)
.format('#,##0')
.alias('$ Total Sales');

const locationResort = Model.attribute(locationResortIdentifier);

export class BarChartExportExample extends Component {
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
        console.info("AttributeFilterExample onLoadingChanged", ...params);
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
                [elementsProp]: filter[elementsProp].map(element => (`${locationResortUri}/elements?id=${element}`))
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
                    in: filter.in.map(element => `${locationResortUri}/elements?id=${element}`),
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
                    notIn: filter.notIn.map(element => `${locationResortUri}/elements?id=${element}`),
                },
            },
        ];
        this.setState({ filters });
    }
    onError(...params) {
        // eslint-disable-next-line no-console
        console.info("AttributeFilterExample onLoadingChanged", ...params);
    }
    

    render() {

        const { filters, error } = this.state;
        return (
            <ExampleWithExport>
                {onExportReady => (
                    <div>
                    <AttributeFilter
                        identifier={locationResortIdentifier}
                        projectId={projectId}
                        fullscreenOnMobile={false}
                        onApply={this.onApply}
                    />
                    <div style={{ height: 300 }} className="s-bar-chart">
                        <BarChart
                            projectId={projectId}
                            measures={[amount]}
                            viewBy={locationResort}
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

export default BarChartExportExample;
