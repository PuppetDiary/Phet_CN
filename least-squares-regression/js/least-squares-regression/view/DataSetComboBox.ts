// Copyright 2014-2025, University of Colorado Boulder

/**
 * Combo box for selecting a DataSet.
 *
 * @author Martin Veillette (Berea College)
 */

import Property from '../../../../axon/js/Property.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import ComboBox, { ComboBoxItem } from '../../../../sun/js/ComboBox.js';
import leastSquaresRegression from '../../leastSquaresRegression.js';
import LeastSquaresRegressionConstants from '../LeastSquaresRegressionConstants.js';
import DataSet from '../model/DataSet.js';

export default class DataSetComboBox extends ComboBox<DataSet> {

  /**
   * @param selectedDataSetProperty - The property that holds the currently selected DataSet.
   * @param dataSets - Array of DataSets to populate the combo box.
   * @param dataSetListParent - The parent node for the combo box list.
   * @param maxTextWidth - Maximum width of text in the combo box items.
   */
  public constructor(
    selectedDataSetProperty: Property<DataSet>,
    dataSets: DataSet[],
    dataSetListParent: Node,
    maxTextWidth: number
  ) {
    // Create the ComboBoxItem array by mapping DataSets to ComboBoxItems
    const items = dataSets.map( dataSet => createItem( dataSet, maxTextWidth ) );

    super( selectedDataSetProperty, items, dataSetListParent, {
      listPosition: 'below',
      highlightFill: LeastSquaresRegressionConstants.ITEM_HIGHLIGHT_FILL,
      buttonLineWidth: 1,
      xMargin: 14,
      yMargin: 8,
      cornerRadius: LeastSquaresRegressionConstants.SMALL_PANEL_CORNER_RADIUS
    } );
  }
}

leastSquaresRegression.register( 'DataSetComboBox', DataSetComboBox );

/**
 * Creates an item for the combo box.
 */
function createItem( dataSet: DataSet, maxTextWidth: number ): ComboBoxItem<DataSet> {
  return {
    value: dataSet,
    createNode: () => new Text( dataSet.name, {
      font: LeastSquaresRegressionConstants.TEXT_FONT,
      maxWidth: maxTextWidth
    } )
  };
}