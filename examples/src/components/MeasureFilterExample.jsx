// (C) 2007-2018 GoodData Corporation

import React, { Component } from 'react';
import { ColumnChart, Model } from '@gooddata/react-components';

import '@gooddata/react-components/styles/css/main.css';

import { totalSalesIdentifier, monthDateIdentifier, projectId } from '../utils/fixtures';

export class MeasureFilterExample extends Component {
    render() {
        return (
            <div style={{ height: 300 }} className="s-measure-filter">
            <ColumnChart
                projectId={projectId}
                measures={[{
                    measure: {
                        localIdentifier: 'totalSales',
                        definition: {
                            measureDefinition: {
                                item: {
                                    identifier: 'aa7ulGyKhIE5'
                                },
                                filters: [
                                    {
                                        positiveAttributeFilter: {
                                            displayForm: {
                                                identifier: 'label.restaurantlocation.locationstate'
                                            },
                                            in: ['Florida', 'Texas'],
                                            textFilter: true
                                        }
                                    }
                                ],
                            }
                        },
                        alias: 'Location State'
                    }
                }]}
            />
        </div>
        );
    }
}
export default MeasureFilterExample;
