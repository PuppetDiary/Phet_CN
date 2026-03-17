// Copyright 2019-2025, University of Colorado Boulder

/**
 * Class for the 'Objects' accordion box, which is the panel in the lower right corner of the sim that displays an
 * environment for counting with various objects.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import Property from '../../../../axon/js/Property.js';
import { TReadOnlyEmitter } from '../../../../axon/js/TEmitter.js';
import CountingCommonConstants from '../../../../counting-common/js/common/CountingCommonConstants.js';
import BaseNumber from '../../../../counting-common/js/common/model/BaseNumber.js';
import CountingObjectType from '../../../../counting-common/js/common/model/CountingObjectType.js';
import BaseNumberNode from '../../../../counting-common/js/common/view/BaseNumberNode.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import optionize from '../../../../phet-core/js/optionize.js';
import PickOptional from '../../../../phet-core/js/types/PickOptional.js';
import StrictOmit from '../../../../phet-core/js/types/StrictOmit.js';
import Image from '../../../../scenery/js/nodes/Image.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Color from '../../../../scenery/js/util/Color.js';
import RectangularRadioButtonGroup, { RectangularRadioButtonGroupItem } from '../../../../sun/js/buttons/RectangularRadioButtonGroup.js';
import numberSuiteCommon from '../../numberSuiteCommon.js';
import NumberSuiteCommonStrings from '../../NumberSuiteCommonStrings.js';
import CountingArea from '../model/CountingArea.js';
import NumberSuiteCommonConstants from '../NumberSuiteCommonConstants.js';
import CountingAreaNode from './CountingAreaNode.js';
import NumberSuiteCommonAccordionBox, { NumberSuiteCommonAccordionBoxOptions } from './NumberSuiteCommonAccordionBox.js';

// types
type SelfOptions = {
  countingObjectTypes?: CountingObjectType[] | null;
  linkedCountingArea?: CountingArea | null;
  linkStatusChangedEmitter?: TReadOnlyEmitter<[ boolean ]> | null;
};
export type CountingAccordionBoxOptions = SelfOptions &
  StrictOmit<NumberSuiteCommonAccordionBoxOptions, 'titleStringProperty'> &
  PickOptional<NumberSuiteCommonAccordionBoxOptions, 'titleStringProperty'>;

// constants
const RADIO_BUTTON_SIZE = new Dimension2( 28, 28 ); // in screen coordinates

class CountingAccordionBox extends NumberSuiteCommonAccordionBox {
  public readonly countingAreaNode: CountingAreaNode;

  public constructor( countingArea: CountingArea,
                      countingObjectTypeProperty: EnumerationProperty<CountingObjectType>,
                      width: number,
                      height: number,
                      providedOptions: CountingAccordionBoxOptions ) {

    const options = optionize<CountingAccordionBoxOptions, SelfOptions, NumberSuiteCommonAccordionBoxOptions>()( {
      titleStringProperty: NumberSuiteCommonStrings.objectsStringProperty,
      titleTextOptions: {
        maxWidth: NumberSuiteCommonConstants.LOWER_ACCORDION_BOX_TITLE_MAX_WIDTH
      },
      countingObjectTypes: null,
      linkedCountingArea: null,
      linkStatusChangedEmitter: null
    }, providedOptions );

    super( width, new Property<number>( height ), options );

    this.countingAreaNode = new CountingAreaNode( countingArea, countingObjectTypeProperty, this.contentBoundsProperty );
    this.contentNode.addChild( this.countingAreaNode );

    let radioButtonGroup: RectangularRadioButtonGroup<CountingObjectType> | null = null;
    if ( options.countingObjectTypes ) {

      // create the icons for the RectangularRadioButtonGroup
      const buttons: RectangularRadioButtonGroupItem<CountingObjectType>[] = [];
      options.countingObjectTypes.forEach( countingObjectType => {
        let iconNode: Node | null = null;
        if ( countingObjectType === CountingObjectType.PAPER_NUMBER ) {
          iconNode = new BaseNumberNode( new BaseNumber( 1, 0 ), 1 );
          iconNode.setScaleMagnitude( RADIO_BUTTON_SIZE.height / iconNode.height );
        }
        else {
          iconNode = new Image( CountingCommonConstants.COUNTING_OBJECT_TYPE_TO_IMAGE.get( countingObjectType ), {
            maxWidth: RADIO_BUTTON_SIZE.width,
            maxHeight: RADIO_BUTTON_SIZE.height
          } );
        }

        buttons.push( {
          value: countingObjectType,
          createNode: () => iconNode
        } );
      } );

      // create and add the RectangularRadioButtonGroup, which is a control for changing the CountingObjectType of the countingObjects
      radioButtonGroup = new RectangularRadioButtonGroup( countingObjectTypeProperty, buttons, {
        orientation: 'horizontal',
        spacing: 10,
        radioButtonOptions: {
          baseColor: Color.WHITE
        }
      } );
      radioButtonGroup.right = this.contentBoundsProperty.value.right - CountingCommonConstants.COUNTING_AREA_MARGIN;
      radioButtonGroup.bottom = this.contentBoundsProperty.value.bottom - CountingCommonConstants.COUNTING_AREA_MARGIN;
      this.contentNode.addChild( radioButtonGroup );
    }

    // add the linked countingArea
    if ( options.linkedCountingArea && options.linkStatusChangedEmitter ) {
      const linkedObjectsCountingAreaNode = new CountingAreaNode(
        options.linkedCountingArea,
        countingObjectTypeProperty,
        this.contentBoundsProperty, {
          viewHasIndependentModel: false
        }
      );
      linkedObjectsCountingAreaNode.visible = false;
      this.contentNode.addChild( linkedObjectsCountingAreaNode );

      options.linkStatusChangedEmitter.addListener( objectsLinked => {
        linkedObjectsCountingAreaNode.visible = objectsLinked;
        this.countingAreaNode.visible = !objectsLinked;
        radioButtonGroup && radioButtonGroup.moveToFront();
      } );
    }
  }
}

numberSuiteCommon.register( 'CountingAccordionBox', CountingAccordionBox );
export default CountingAccordionBox;