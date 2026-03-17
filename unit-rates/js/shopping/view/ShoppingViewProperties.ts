// Copyright 2016-2023, University of Colorado Boulder

/**
 * The union of view Properties used in the 'Shopping' and 'Shopping Lab' screens.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import unitRates from '../../unitRates.js';

export default class ShoppingViewProperties {

  // Is the 'Double Number Line' accordion box expanded?
  public readonly doubleNumberLineExpandedProperty: BooleanProperty;

  // Is the 'Questions' accordion box expanded?
  public readonly questionsExpandedProperty: BooleanProperty;

  // Is the cost display expanded on the scale?
  public readonly scaleCostExpandedProperty: BooleanProperty;

  // Is the 'Rate' accordion box expanded?
  public readonly rateExpandedProperty: BooleanProperty;

  public constructor() {
    this.doubleNumberLineExpandedProperty = new BooleanProperty( true );
    this.questionsExpandedProperty = new BooleanProperty( true );
    this.scaleCostExpandedProperty = new BooleanProperty( true );
    this.rateExpandedProperty = new BooleanProperty( true );
  }

  public reset(): void {
    this.doubleNumberLineExpandedProperty.reset();
    this.questionsExpandedProperty.reset();
    this.scaleCostExpandedProperty.reset();
    this.rateExpandedProperty.reset();
  }
}

unitRates.register( 'ShoppingViewProperties', ShoppingViewProperties );