// Copyright 2024-2025, University of Colorado Boulder

/**
 * A row in the PDL that contains a checkbox, label and icon (sometimes the icon is just a blank Node though).
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import AlignGroup from '../../../../scenery/js/layout/constraints/AlignGroup.js';
import HBox from '../../../../scenery/js/layout/nodes/HBox.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import projectileDataLab from '../../projectileDataLab.js';
import PDLText from './PDLText.js';

// All icons from all screens fit the same footprint, so we can use the same alignGroup for all of them
const alignGroup = new AlignGroup();

export default class PDLCheckboxRow extends HBox {

  public constructor( label: TReadOnlyProperty<string>, icon: Node ) {

    super( {
      spacing: 5,
      stretch: true, children: [ new PDLText( label, {
        maxWidth: 110
      } ), alignGroup.createBox( icon ) ]
    } );
  }
}

projectileDataLab.register( 'PDLCheckboxRow', PDLCheckboxRow );