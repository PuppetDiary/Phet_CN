// Copyright 2024-2025, University of Colorado Boulder

/**
 * Panel that allows the user to select a projectile. This appears in all VSM screens. The selected projectile is displayed
 * in the panel  and highlighted in the play area. The ProjectileSelectorPanel is analogous to the
 * SampleSelectorNode that appears on the Sampling screen.
 *
 * @author Matthew Blackman (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Multilink from '../../../../axon/js/Multilink.js';
import PatternStringProperty from '../../../../axon/js/PatternStringProperty.js';
import Property from '../../../../axon/js/Property.js';
import TProperty from '../../../../axon/js/TProperty.js';
import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import Matrix3 from '../../../../dot/js/Matrix3.js';
import Range from '../../../../dot/js/Range.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import StrictOmit from '../../../../phet-core/js/types/StrictOmit.js';
import HBox from '../../../../scenery/js/layout/nodes/HBox.js';
import VBox from '../../../../scenery/js/layout/nodes/VBox.js';
import Image from '../../../../scenery/js/nodes/Image.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import ToggleNode from '../../../../sun/js/ToggleNode.js';
import PhetioObject from '../../../../tandem/js/PhetioObject.js';
import cannonball_png from '../../../images/cannonball_png.js';
import pianoLandedSelected_png from '../../../images/pianoLandedSelected_png.js';
import pumpkin1LandedSelected_png from '../../../images/pumpkin1LandedSelected_png.js';
import pumpkin2LandedSelected_png from '../../../images/pumpkin2LandedSelected_png.js';
import pumpkin3LandedSelected_png from '../../../images/pumpkin3LandedSelected_png.js';
import Field from '../../common/model/Field.js';
import Projectile from '../../common/model/Projectile.js';
import ProjectileSound from '../../common/model/ProjectileSound.js';
import ProjectileType, { CANNONBALL, PIANO, PUMPKIN } from '../../common/model/ProjectileType.js';
import PDLConstants, { IS_CURRENTLY_AUTO_GENERATING_DATA_PROPERTY } from '../../common/PDLConstants.js';
import LauncherIconNode from '../../common/view/LauncherIconNode.js';
import PDLText from '../../common/view/PDLText.js';
import SelectorNode, { SelectorNodeOptions } from '../../common/view/SelectorNode.js';
import projectileDataLab from '../../projectileDataLab.js';
import ProjectileDataLabStrings from '../../ProjectileDataLabStrings.js';

const PUMPKIN_LANDED_IMAGES = [ pumpkin1LandedSelected_png, pumpkin2LandedSelected_png, pumpkin3LandedSelected_png ];

type SelfOptions = EmptySelfOptions;
type ProjectileSelectorNodeOptions = SelfOptions & StrictOmit<SelectorNodeOptions, 'playSound'>;

type Depiction = {
  type: ProjectileType;
  isFlippedHorizontally: boolean;
  landedImageIndex?: number;
};

const depictions: Depiction[] = [
  { type: CANNONBALL, isFlippedHorizontally: false },
  { type: CANNONBALL, isFlippedHorizontally: true },
  { type: PIANO, isFlippedHorizontally: false },
  { type: PIANO, isFlippedHorizontally: true },
  { type: PUMPKIN, isFlippedHorizontally: false, landedImageIndex: 0 },
  { type: PUMPKIN, isFlippedHorizontally: true, landedImageIndex: 0 },
  { type: PUMPKIN, isFlippedHorizontally: false, landedImageIndex: 1 },
  { type: PUMPKIN, isFlippedHorizontally: true, landedImageIndex: 1 },
  { type: PUMPKIN, isFlippedHorizontally: false, landedImageIndex: 2 },
  { type: PUMPKIN, isFlippedHorizontally: true, landedImageIndex: 2 }
];

export default class ProjectileSelectorNode extends SelectorNode {

  public constructor(
    fieldProperty: TReadOnlyProperty<Field>,
    selectedProjectileNumberProperty: TProperty<number> & PhetioObject,
    totalProjectileCountProperty: TReadOnlyProperty<number>,
    numberOfLandedProjectilesProperty: TReadOnlyProperty<number>,
    selectedProjectileProperty: TReadOnlyProperty<Projectile | null>,
    providedOptions: ProjectileSelectorNodeOptions ) {

    const options = optionize<ProjectileSelectorNodeOptions, SelfOptions, SelectorNodeOptions>()( {
      playSound: projectileNumber => {
        const projectile = fieldProperty.value.landedProjectiles[ projectileNumber - 1 ];
        ProjectileSound.play( projectile.type, projectile.x, false );
      }
    }, providedOptions );

    const rangeProperty = new DerivedProperty( [ IS_CURRENTLY_AUTO_GENERATING_DATA_PROPERTY, selectedProjectileNumberProperty, numberOfLandedProjectilesProperty, totalProjectileCountProperty, selectedProjectileProperty ],
      ( ( isCurrentlyAutoGeneratingData, selectedProjectileNumber, numberOfLandedProjectiles, totalProjectileCount ) => {

        // Projectiles are added to the data set when they land
        if ( numberOfLandedProjectiles === 0 || isCurrentlyAutoGeneratingData ) {
          return new Range( 0, 0 );
        }
        else if ( totalProjectileCount > numberOfLandedProjectiles ) {

          // If some are airborne, then disable the buttons, freezing at the currently selected value
          return new Range( selectedProjectileNumber, selectedProjectileNumber );
        }
        else {

          // Everything is landed, everything can be selected
          return new Range( 1, numberOfLandedProjectiles );
        }
      } ), {
        valueComparisonStrategy: 'equalsFunction'
      } );

    // This is an intermediate "plumbing" Property used to wire up to the ToggleNode. It does not need to be PhET-iO instrumented
    // because the value is derived from the selectedProjectileProperty (which is PhET-iO instrumented), and set in the
    // Multilink. (It is somewhat akin to a DerivedProperty in this way).
    const depictionProperty = new Property<Depiction>( depictions[ 0 ] );

    const createNode = ( depiction: Depiction ) => {
      const imagePNG = depiction.type === PUMPKIN ? PUMPKIN_LANDED_IMAGES[ depiction.landedImageIndex! ] :
                       depiction.type === PIANO ? pianoLandedSelected_png :
                       cannonball_png;

      const PUMPKIN_SCALE = 0.18;
      const imageScale = depiction.type === PUMPKIN ? PUMPKIN_SCALE : depiction.type === PIANO ? 0.14 : 0.2;

      const iconImage = new Image( imagePNG, { scale: imageScale } );


      // For pumpkins, normalize their dimensions so the layout doesn't jump around, see https://github.com/phetsims/projectile-data-lab/issues/259
      const layoutNodes: Node[] = [];
      if ( depiction.type === PUMPKIN ) {
        const widestIconWidth = Math.max( ...PUMPKIN_LANDED_IMAGES.map( image => image.width ) );
        const tallestIconWidth = Math.max( ...PUMPKIN_LANDED_IMAGES.map( image => image.height ) );

        const pumpkinBox = new Rectangle( 0, 0, widestIconWidth, tallestIconWidth, { fill: null, stroke: null, scale: PUMPKIN_SCALE } );
        layoutNodes.push( pumpkinBox );
        iconImage.centerBottom = pumpkinBox.centerBottom;
      }

      return new Node( {
        children: [ ...layoutNodes, iconImage ],
        matrix: Matrix3.scale( depiction.isFlippedHorizontally ? -1 : 1, 1 )
      } );
    };

    const projectileToggleNode = new ToggleNode( depictionProperty, depictions.map( depiction => ( {
        createNode: () => createNode( depiction ),
        value: depiction
      } ) ), {
        // Ensure that the visible content is centered independently of the other content in the ToggleNode
        unselectedChildrenSceneGraphStrategy: 'excluded'
      }
    );

    const launcherIconNode = new LauncherIconNode( {
      visibleProperty: new DerivedProperty( [ selectedProjectileProperty ], projectile => projectile !== null )
    } );

    Multilink.multilink( [ selectedProjectileProperty, selectedProjectileNumberProperty, numberOfLandedProjectilesProperty ],
      selectedProjectile => {

        if ( selectedProjectile ) {

          // Use a reference lookup because it is what ToggleNode supports for equality checking
          const lookup = depictions.find( depiction => {

            if ( depiction.type === CANNONBALL || depiction.type === PIANO ) {
              return depiction.type === selectedProjectile.type &&
                     depiction.isFlippedHorizontally === selectedProjectile.isFlippedHorizontally;
            }
            else {
              return depiction.type === selectedProjectile.type &&
                     depiction.isFlippedHorizontally === selectedProjectile.isFlippedHorizontally &&
                     depiction.landedImageIndex !== selectedProjectile.landedImageIndex;
            }
          } );

          depictionProperty.value = lookup!;

          launcherIconNode.updateIcon(
            selectedProjectile.launcherOrientation,
            selectedProjectile.launcher.mysteryOrCustom,
            selectedProjectile.launcher,
            selectedProjectile.launcherMechanism,
            selectedProjectile.launcherStandardDeviationAngle
          );

          projectileToggleNode.visible = true;
        }
        else {
          projectileToggleNode.visible = false;
        }
      }
    );

    const patternStringProperty = new PatternStringProperty( ProjectileDataLabStrings.numberOfCountPatternStringProperty, {
      number: selectedProjectileNumberProperty,
      count: numberOfLandedProjectilesProperty
    } );
    const titleStringProperty = new DerivedProperty(
      [ numberOfLandedProjectilesProperty, patternStringProperty, ProjectileDataLabStrings.noDataStringProperty ],
      ( numberOfLandedProjectiles, patternString, noDataString ) => {
        return numberOfLandedProjectiles === 0 ? noDataString : patternString;
      } );

    const contents = new VBox( {
      children: [
        new PDLText( titleStringProperty, {
          maxWidth: 68,
          font: PDLConstants.SELECTOR_FONT
        } ),
        projectileToggleNode
      ],
      minContentWidth: 68,
      spacing: 4,
      align: 'center',
      justify: 'center'
    } );

    const contentsWithLauncherIcon = new HBox( {
      children: [
        launcherIconNode,
        contents
      ],
      justify: 'center',
      preferredWidth: 107,
      preferredHeight: 45,
      leftMargin: 5
    } );

    super( contentsWithLauncherIcon, selectedProjectileNumberProperty, rangeProperty, options );
  }
}

projectileDataLab.register( 'ProjectileSelectorNode', ProjectileSelectorNode );