// Copyright 2024-2025, University of Colorado Boulder

/**
 * DistanceStatementAccordionBox is the accordion box titled 'Distance Statement'.
 *
 * @author Saurabh Totey
 * @author Chris Malley (PixelZoom, Inc.)
 */

import NLCConstants from '../../../../number-line-common/js/common/NLCConstants.js';
import { optionize4 } from '../../../../phet-core/js/optionize.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import StrictOmit from '../../../../phet-core/js/types/StrictOmit.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { NodeTranslationOptions } from '../../../../scenery/js/nodes/Node.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import AccordionBox, { AccordionBoxOptions } from '../../../../sun/js/AccordionBox.js';
import numberLineDistance from '../../numberLineDistance.js';
import NumberLineDistanceStrings from '../../NumberLineDistanceStrings.js';
import AbstractNLDBaseModel from '../model/AbstractNLDBaseModel.js';
import DistanceStatementNode from './DistanceStatementNode.js';

type SelfOptions = {
  distanceStatementNodeOptions?: {
    controlsValues?: boolean;
  };
};

type DistanceStatementAccordionBoxOptions = SelfOptions & NodeTranslationOptions
  & PickRequired<AccordionBoxOptions, 'expandedProperty'>;

export default class DistanceStatementAccordionBox extends AccordionBox {

  public constructor( model: AbstractNLDBaseModel, providedOptions: DistanceStatementAccordionBoxOptions ) {

    const options = optionize4<DistanceStatementAccordionBoxOptions, StrictOmit<SelfOptions, 'distanceStatementNodeOptions'>, AccordionBoxOptions>()(
      {}, NLCConstants.ACCORDION_BOX_COMMON_OPTIONS, {

        // AccordionBoxOptions
        titleNode: new Text( NumberLineDistanceStrings.distanceStatementStringProperty, {
          font: new PhetFont( 16 ),
          maxWidth: 300
        } ),
        contentAlign: 'center',
        minWidth: 340,
        maxWidth: 340
      }, providedOptions );

    super( new DistanceStatementNode( model, options.distanceStatementNodeOptions ), options );
  }
}

numberLineDistance.register( 'DistanceStatementAccordionBox', DistanceStatementAccordionBox );