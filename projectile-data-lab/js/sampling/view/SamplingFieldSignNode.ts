// Copyright 2023-2025, University of Colorado Boulder

/**
 * The SamplingFieldSignNode shows the launcher number and the number of projectiles that have landed in that field.
 *
 * @author Matthew Blackman (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import PatternStringProperty from '../../../../axon/js/PatternStringProperty.js';
import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import VBox from '../../../../scenery/js/layout/nodes/VBox.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import Field from '../../common/model/Field.js';
import Launcher from '../../common/model/Launcher.js';
import PDLColors from '../../common/PDLColors.js';
import PDLConstants from '../../common/PDLConstants.js';
import FieldSignNode, { FieldSignNodeOptions } from '../../common/view/FieldSignNode.js';
import projectileDataLab from '../../projectileDataLab.js';
import ProjectileDataLabStrings from '../../ProjectileDataLabStrings.js';
import SampleSelectorNode from './SampleSelectorNode.js';

type SelfOptions = EmptySelfOptions;
type SamplingFieldSignNodeOptions = SelfOptions & FieldSignNodeOptions;

export default class SamplingFieldSignNode extends FieldSignNode {

  public constructor( fieldProperty: TReadOnlyProperty<Field>,
                      launcherProperty: TReadOnlyProperty<Launcher>,
                      sampleSizeProperty: TReadOnlyProperty<number>,
                      sampleSelectorNode: SampleSelectorNode,
                      providedOptions?: SamplingFieldSignNodeOptions ) {

    const options = optionize<SamplingFieldSignNodeOptions, SelfOptions, FieldSignNodeOptions>()( {}, providedOptions );

    const launcherNumberProperty = new DerivedProperty( [ launcherProperty ], launcher => launcher.launcherNumber );
    const launcherNumberStringProperty = new PatternStringProperty( ProjectileDataLabStrings.launcherNumberPatternStringProperty, {
      number: launcherNumberProperty
    } );

    const sampleSizeStringProperty = new PatternStringProperty( ProjectileDataLabStrings.sampleSizeNPatternStringProperty, {
      sampleSize: sampleSizeProperty
    } );

    const launcherNumberText = new Text( launcherNumberStringProperty, {
      fill: PDLColors.fieldSignTextFillProperty,
      font: PDLConstants.SAMPLING_FIELD_SIGN_FONT
    } );

    const sampleSizeText = new Text( sampleSizeStringProperty, {
      fill: PDLColors.fieldSignTextFillProperty,
      font: PDLConstants.SAMPLING_FIELD_SIGN_FONT
    } );

    const fieldSignHeadingContainer = new VBox( {
      children: [ launcherNumberText, sampleSizeText ],
      align: 'center',
      spacing: 3,
      maxWidth: 120
    } );

    super( fieldProperty, fieldSignHeadingContainer, sampleSelectorNode, 25, options );
  }
}

projectileDataLab.register( 'SamplingFieldSignNode', SamplingFieldSignNode );