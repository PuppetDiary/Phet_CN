// Copyright 2013-2024, University of Colorado Boulder

/**
 * View for the 'Point-Slope' screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Tandem from '../../../../tandem/js/Tandem.js';
import GraphControlPanel from '../../common/view/GraphControlPanel.js';
import LineFormsScreenView from '../../common/view/LineFormsScreenView.js';
import LineFormsViewProperties from '../../common/view/LineFormsViewProperties.js';
import graphingLines from '../../graphingLines.js';
import PointSlopeModel from '../model/PointSlopeModel.js';
import PointSlopeEquationAccordionBox from './PointSlopeEquationAccordionBox.js';
import PointSlopeGraphNode from './PointSlopeGraphNode.js';

export default class PointSlopeScreenView extends LineFormsScreenView {

  public constructor( model: PointSlopeModel, tandem: Tandem ) {

    const viewProperties = new LineFormsViewProperties();

    const graphNode = new PointSlopeGraphNode( model, viewProperties );

    const graphControlPanel = new GraphControlPanel( viewProperties.gridVisibleProperty,
      viewProperties.slopeToolVisibleProperty, model.standardLines );

    const equationAccordionBox = new PointSlopeEquationAccordionBox( model,
      viewProperties.interactiveEquationVisibleProperty, tandem.createTandem( 'equationAccordionBox' ) );

    super( model, viewProperties, graphNode, graphControlPanel, equationAccordionBox, tandem );
  }
}

graphingLines.register( 'PointSlopeScreenView', PointSlopeScreenView );