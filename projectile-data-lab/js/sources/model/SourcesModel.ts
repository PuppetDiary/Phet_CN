// Copyright 2023-2024, University of Colorado Boulder

/**
 * The SourcesModel contains the model for the Sources screen.
 *
 * @author Matthew Blackman (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import { PhetioObjectOptions } from '../../../../tandem/js/PhetioObject.js';
import LauncherMechanism from '../../common-vsm/model/LauncherMechanism.js';
import SMField from '../../common-vsm/model/SMField.js';
import SMModel, { SMModelOptions } from '../../common-vsm/model/SMModel.js';
import { VSMFieldIdentifierValues } from '../../common-vsm/model/VSMFieldIdentifier.js';
import Launcher from '../../common/model/Launcher.js';
import PDLConstants from '../../common/PDLConstants.js';
import projectileDataLab from '../../projectileDataLab.js';

type SelfOptions = EmptySelfOptions;

type SourcesModelOptions = SelfOptions & PickRequired<PhetioObjectOptions, 'tandem'>;

export default class SourcesModel extends SMModel<SMField> {

  public constructor( providedOptions: SourcesModelOptions ) {

    const options = optionize<SourcesModelOptions, SelfOptions, SMModelOptions>()( {
      isStandardDeviationAnglePropertyPhetioInstrumented: true
    }, providedOptions );

    const fieldsTandem = options.tandem.createTandem( 'fields' );

    const fields = VSMFieldIdentifierValues.map( identifier => {
      const fieldTandem = fieldsTandem.createTandem( identifier );

      const customLauncher = new Launcher(
        'custom',
        LauncherMechanism.SPRING,
        PDLConstants.ANGLE_STANDARD_DEVIATION_RANGE.getCenter(),
        1, {
          tandem: fieldTandem.createTandem( 'customLauncher' ),
          phetioFeatured: true
        } );

      return new SMField( [ customLauncher ], identifier, {
        tandem: fieldTandem,
        phetioFeatured: true,
        isLauncherPropertyPhetioReadOnly: false
      } );
    } );

    super( fields, options );
  }
}

projectileDataLab.register( 'SourcesModel', SourcesModel );