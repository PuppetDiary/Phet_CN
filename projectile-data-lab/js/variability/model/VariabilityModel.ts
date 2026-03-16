// Copyright 2023-2024, University of Colorado Boulder

/**
 * The VariabilityModel for Projectile Data Lab.
 *
 * @author Matthew Blackman (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import StrictOmit from '../../../../phet-core/js/types/StrictOmit.js';
import WithRequired from '../../../../phet-core/js/types/WithRequired.js';
import VSMField from '../../common-vsm/model/VSMField.js';
import { VSMFieldIdentifierValues } from '../../common-vsm/model/VSMFieldIdentifier.js';
import VSMModel, { VSMModelOptions } from '../../common-vsm/model/VSMModel.js';
import { MYSTERY_LAUNCHERS } from '../../common/model/Launcher.js';
import projectileDataLab from '../../projectileDataLab.js';

type SelfOptions = EmptySelfOptions;
type VariabilityModelOptions = SelfOptions & StrictOmit<WithRequired<VSMModelOptions<VSMField>, 'tandem'>, 'isStandardDeviationAnglePropertyPhetioInstrumented'>;

export default class VariabilityModel extends VSMModel<VSMField> {

  public constructor( providedOptions: VariabilityModelOptions ) {

    const options = optionize<VariabilityModelOptions, SelfOptions, VSMModelOptions<VSMField>>()( {
      isStandardDeviationAnglePropertyPhetioInstrumented: false
    }, providedOptions );

    const fieldsTandem = providedOptions.tandem.createTandem( 'fields' );

    const fields = VSMFieldIdentifierValues.map( identifier => {
      return new VSMField( MYSTERY_LAUNCHERS, identifier, {
        tandem: fieldsTandem.createTandem( identifier ),
        phetioFeatured: true,
        isLauncherPropertyPhetioReadOnly: false
      } );
    } );

    super( fields, options );
  }
}

projectileDataLab.register( 'VariabilityModel', VariabilityModel );