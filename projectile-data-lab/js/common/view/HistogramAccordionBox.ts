// Copyright 2023-2025, University of Colorado Boulder

/**
 * The HistogramAccordionBox is an accordion UI component for the Projectile Data Lab simulation.
 * It contains the histogram component as well as associated controls.
 *
 * @author Matthew Blackman (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import WithRequired from '../../../../phet-core/js/types/WithRequired.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import AccordionBox, { AccordionBoxOptions } from '../../../../sun/js/AccordionBox.js';
import projectileDataLab from '../../projectileDataLab.js';
import ProjectileDataLabStrings from '../../ProjectileDataLabStrings.js';
import PDLColors from '../PDLColors.js';
import PDLText from './PDLText.js';

type SelfOptions = EmptySelfOptions;

export type HistogramAccordionBoxOptions =
  SelfOptions
  & WithRequired<AccordionBoxOptions, 'tandem'>;

export const histogramAccordionBoxTandemName = 'histogramAccordionBox';

const MARGIN = 8;

export default class HistogramAccordionBox extends AccordionBox {
  public constructor( content: Node,
                      providedOptions: HistogramAccordionBoxOptions ) {

    const options = optionize<HistogramAccordionBoxOptions, SelfOptions, AccordionBoxOptions>()( {
      fill: PDLColors.panelFillProperty,
      stroke: PDLColors.panelStrokeProperty,
      titleAlignX: 'left',
      titleXSpacing: MARGIN,
      buttonXMargin: MARGIN,
      buttonYMargin: MARGIN,
      contentYMargin: MARGIN,
      contentYSpacing: 0,
      cornerRadius: 5,
      titleNode: new PDLText( ProjectileDataLabStrings.histogramStringProperty, {
        maxWidth: 600
      } )
    }, providedOptions );

    super( content, options );
  }
}

projectileDataLab.register( 'HistogramAccordionBox', HistogramAccordionBox );