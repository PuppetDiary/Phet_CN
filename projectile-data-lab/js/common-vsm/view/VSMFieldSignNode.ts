// Copyright 2023-2025, University of Colorado Boulder

/**
 * The VSMFieldSignNode shows the field number and the projectile selector node for VSM screens. It has its own layout
 * for the heading and the contents of the field sign.
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
import PDLColors from '../../common/PDLColors.js';
import PDLConstants from '../../common/PDLConstants.js';
import FieldSignNode, { FieldSignNodeOptions } from '../../common/view/FieldSignNode.js';
import projectileDataLab from '../../projectileDataLab.js';
import ProjectileDataLabStrings from '../../ProjectileDataLabStrings.js';
import ProjectileSelectorNode from './ProjectileSelectorNode.js';

type SelfOptions = EmptySelfOptions;
type VSMFieldSignNodeOptions = SelfOptions & FieldSignNodeOptions;

export default class VSMFieldSignNode extends FieldSignNode {
  public constructor( fields: Field[],
                      fieldProperty: TReadOnlyProperty<Field>,
                      projectileSelectorNode: ProjectileSelectorNode,
                      providedOptions?: VSMFieldSignNodeOptions ) {

    const options = optionize<VSMFieldSignNodeOptions, SelfOptions, FieldSignNodeOptions>()( {}, providedOptions );

    const fieldSignStringProperty = new PatternStringProperty( ProjectileDataLabStrings.fieldNumberPatternStringProperty, {
      number: new DerivedProperty( [ fieldProperty ], field => {
        return fields.indexOf( field ) + 1;
      } )
    } );

    const fieldNumberText = new Text( fieldSignStringProperty, {
      fill: PDLColors.fieldSignTextFillProperty,
      font: PDLConstants.VSM_FIELD_SIGN_FONT
    } );

    const fieldSignHeadingContainer = new VBox( {
      children: [ fieldNumberText ],
      align: 'center',
      maxWidth: 100
    } );

    super( fieldProperty, fieldSignHeadingContainer, projectileSelectorNode, 34, options );
  }
}

projectileDataLab.register( 'VSMFieldSignNode', VSMFieldSignNode );