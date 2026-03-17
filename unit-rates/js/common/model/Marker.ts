// Copyright 2017-2025, University of Colorado Boulder

/**
 * Model of a marker, used to indicate a rate on the double number line.
 * Markers can be major or minor (with semantics similar to major and minor tick marks on a slider).
 * Markers have an associated creator, which determines their precedence; markers created by higher precedence creators
 * will replace markers created by lower precedence creators.  For example, a marker created by answering a question
 * will replace a marker that was created with the marker editor.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import optionize from '../../../../phet-core/js/optionize.js';
import Color from '../../../../scenery/js/util/Color.js';
import unitRates from '../../unitRates.js';
import Axis from './Axis.js';

// How the marker was created. Values are ordered by ascending precedence (described above).
const CreatorValues = [ 'editor', 'scale', 'question', 'unitRateQuestion', 'race' ] as const;
type Creator = ( typeof CreatorValues )[number];

type SelfOptions = {
  isMajor?: boolean; // true: major marker, false: minor marker
  color?: Color | string; // color used to render the marker
  erasable?: boolean; // is this marker erased when the Eraser button is pressed?
};

type MarkerOptions = SelfOptions;

export default class Marker {

  public readonly creator: Creator;
  public readonly numeratorAxis: Axis;
  public readonly denominatorAxis: Axis;
  public readonly numeratorProperty: NumberProperty;
  public readonly denominatorProperty: NumberProperty;
  public readonly isMajor: boolean;
  public readonly colorProperty: Property<Color | string>;

  public erasable: boolean;

  /**
   * @param creator - indicates how the marker was created
   * @param numerator
   * @param denominator
   * @param numeratorAxis
   * @param denominatorAxis
   * @param [providedOptions]
   */
  public constructor( creator: Creator,
                      numerator: number, denominator: number,
                      numeratorAxis: Axis, denominatorAxis: Axis,
                      providedOptions?: MarkerOptions ) {

    const options = optionize<MarkerOptions, SelfOptions>()( {

      // SelfOptions
      isMajor: true,
      color: 'black',
      erasable: true
    }, providedOptions );

    this.creator = creator;
    this.numeratorAxis = numeratorAxis;
    this.denominatorAxis = denominatorAxis;
    this.numeratorProperty = new NumberProperty( numerator );
    this.denominatorProperty = new NumberProperty( denominator );
    this.isMajor = options.isMajor;
    this.colorProperty = new Property( options.color );
    this.erasable = options.erasable;
  }

  /**
   * String representation. For debugging and logging only. Do not rely on the format of this!
   */
  public toString(): string {
    return `${'Marker[' +
              ' rate='}${this.numeratorProperty.value}/${this.denominatorProperty.value
    } creator=${this.creator
    } isMajor=${this.isMajor
    } erasable=${this.erasable
    } ]`;
  }

  /**
   * Does the specified marker conflict with this one?
   * Two markers conflict if they have the same numerator or denominator.
   * This is possible due to rounding errors.
   * See https://github.com/phetsims/unit-rates/issues/148.
   */
  public conflictsWith( marker: Marker ): boolean {
    return ( marker.numeratorProperty.value === this.numeratorProperty.value ) ||
           ( marker.denominatorProperty.value === this.denominatorProperty.value );
  }

  /**
   * Gets the precedence of the specified marker, relative to this marker.
   * The value returned indicates the precedence, as follows:
   *   0: marker has same precedence
   *   > 0: marker has higher precedence
   *   < 0: marker has lower precedence
   *
   */
  public precedenceOf( marker: Marker ): number {
    return CreatorValues.indexOf( marker.creator ) - CreatorValues.indexOf( this.creator );
  }
}

unitRates.register( 'Marker', Marker );