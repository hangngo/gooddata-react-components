// (C) 2007-2019 GoodData Corporation

import React, { Component } from "react";
import { ColumnChart, Model } from "@gooddata/react-components";

import "@gooddata/react-components/styles/css/main.css";

import { franchiseFeesIdentifier, monthDateIdentifier,locationStateDisplayFormIdentifier, locationStateAttributeCaliforniaUri,projectId } from "../utils/fixtures";
const filterPresets = {
    attributeCalifornia: {
        label: "Attribute (California)",
        key: "attributeCalifornia",
        filterItem: Model.positiveAttributeFilter(locationStateDisplayFormIdentifier, [
            locationStateAttributeCaliforniaUri,
        ]),
    }};
    const franchiseFeesCalifornia = Model.measure(franchiseFeesIdentifier)
    .localIdentifier("franchiseFeesCalifornia")
    .alias("FranchiseFees (California)")
    .filters(filterPresets.attributeCalifornia.filterItem);

export class MeasureFilterExample extends Component {
    render() {
        return (
            <div style={{ height: 300 }} className="s-measure-filter">
                <ColumnChart
                    projectId={projectId}
                    // measures={[Model.measure(totalSalesIdentifier).localIdentifier(totalSalesIdentifier)]}
                    // viewBy={Model.attribute(monthDateIdentifier).localIdentifier(monthDateIdentifier)}
                    // sortBy={[Model.measureSortItem(totalSalesIdentifier, "desc")]}
                    //measures={[Model.measure(totalSalesIdentifier).filters(attributeFilter(locationCityDisplayFormIdentifier).in("Dallas"))]}
                    measures={franchiseFeesCalifornia}
                    viewBy={Model.attribute(monthDateIdentifier).localIdentifier(monthDateIdentifier)}
                />
            </div>
        );
    }
}

export default MeasureFilterExample;
