// Copyright 2017-2023, University of Colorado Boulder

/**
 * View-specific Properties for the 'Racing Lab' screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import unitRates from '../../unitRates.js';

export default class RacingLabViewProperties {

  // Are the 'Double Number Line' accordion boxes expanded?
  public readonly doubleNumberLine1ExpandedProperty: BooleanProperty;
  public readonly doubleNumberLine2ExpandedProperty: BooleanProperty;

  // Are the 'Rate' accordion boxes expanded?
  public readonly rate1ExpandedProperty: BooleanProperty;
  public readonly rate2ExpandedProperty: BooleanProperty;

  // Are the race timers expanded?
  public readonly timer1ExpandedProperty: BooleanProperty;
  public readonly timer2ExpandedProperty: BooleanProperty;

  // Are the drag arrows visible that surround the finish flag?
  public readonly arrowsVisibleProperty: BooleanProperty;

  public constructor() {

    this.doubleNumberLine1ExpandedProperty = new BooleanProperty( true );
    this.doubleNumberLine2ExpandedProperty = new BooleanProperty( true );

    this.rate1ExpandedProperty = new BooleanProperty( true );
    this.rate2ExpandedProperty = new BooleanProperty( true );

    this.timer1ExpandedProperty = new BooleanProperty( true );
    this.timer2ExpandedProperty = new BooleanProperty( true );

    this.arrowsVisibleProperty = new BooleanProperty( true );
  }

  public reset(): void {
    this.doubleNumberLine1ExpandedProperty.reset();
    this.doubleNumberLine2ExpandedProperty.reset();
    this.rate1ExpandedProperty.reset();
    this.rate2ExpandedProperty.reset();
    this.timer1ExpandedProperty.reset();
    this.timer2ExpandedProperty.reset();
    this.arrowsVisibleProperty.reset();
  }
}

unitRates.register( 'RacingLabViewProperties', RacingLabViewProperties );