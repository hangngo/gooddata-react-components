// (C) 2007-2018 GoodData Corporation

import React, { Component } from 'react';
import { ColumnChart, Model } from '@gooddata/react-components';

import '@gooddata/react-components/styles/css/main.css';

import { totalSalesIdentifier, monthDateIdentifier, projectId } from '../utils/fixtures';

const filterPresets = {
    attributeCalifornia: {
        label: 'Attribute (California)',
        key: 'attributeCalifornia',
        filterItem: Model.positiveAttributeFilter(
            locationStateDisplayFormIdentifier,
            [locationStateAttributeCaliforniaUri]
        )
    },
    lastYear: {
        label: 'Last year',
        key: 'lastYear',
        filterItem: Model.relativeDateFilter(dateDatasetIdentifier, 'GDC.time.year', -1, -1)
    },
    noData: {
        label: 'No Data',
        key: 'noData',
        filterItem: Model.relativeDateFilter(dateDatasetIdentifier, 'GDC.time.year', 1, 1)
    },
    franchiseFeesCalifornia: {
        label: 'Franchise Fees California',
        key: 'franchiseFeesCalifornia',
        filterItem: null
    }
};

const franchiseFeesCalifornia =
    Model.measure(franchiseFeesIdentifier)
        .localIdentifier('franchiseFeesCalifornia')
        .alias('FranchiseFees (California)')
        .filters(filterPresets.attributeCalifornia.filterItem);

export class MeasureFilterExample extends Component {
    render() {
        return (
            <div style={{ height: 300 }} className="s-measure-filter">
            <ColumnChart
                projectId={projectId}
                franchiseFeesCalifornia
                // measures={[{
                //     measure: {
                //         localIdentifier: 'totalSales',
                //         definition: {
                //             measureDefinition: {
                //                 item: {
                //                     identifier: 'aa7ulGyKhIE5'
                //                 },
                //                 filters: [
                //                     {
                //                         positiveAttributeFilter: {
                //                             displayForm: {
                //                                 identifier: 'label.restaurantlocation.locationstate'
                //                             },
                //                             in: ['Florida', 'Texas'],
                //                             textFilter: true
                //                         }
                //                     }
                //                 ],
                //             }
                //         },
                //         alias: 'Location State'
                //     }
                // }]}
                
            />
        </div>
        );
    }
}
export default MeasureFilterExample;
