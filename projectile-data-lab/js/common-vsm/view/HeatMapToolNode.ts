// Copyright 2023-2025, University of Colorado Boulder

/**
 * The HeatMapToolNode is a base class for tool nodes that show a heat map representation of data. It consists of an
 * array of graphical elements that update opacity as the data changes, as well as background and foreground graphics.
 *
 * NOTE: Due to simulation-specific design and the need to coordinate with the SpeedToolNode and AngleToolNode,
 * this does not extend or compose GaugeNode.
 *
 * @author Matthew Blackman (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import PatternStringProperty from '../../../../axon/js/PatternStringProperty.js';
import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Shape from '../../../../kite/js/Shape.js';
import optionize from '../../../../phet-core/js/optionize.js';
import ManualConstraint from '../../../../scenery/js/layout/constraints/ManualConstraint.js';
import Node, { NodeOptions } from '../../../../scenery/js/nodes/Node.js';
import Path from '../../../../scenery/js/nodes/Path.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import PDLColors from '../../common/PDLColors.js';
import PDLConstants from '../../common/PDLConstants.js';
import PDLText from '../../common/view/PDLText.js';
import projectileDataLab from '../../projectileDataLab.js';

type SelfOptions = {

  // The readout pattern string Property is used to format the value readout.
  readoutPatternStringProperty: TReadOnlyProperty<string>;

  // The display offset is used to position the main display node, which may be offset from the origin of the node.
  displayOffset: Vector2;

  // The needle shape is the shape of the needle that points to the latest value.
  needleShape: Shape;

  // The body shape is the shape of the display panel of the heat map tool.
  bodyShape: Shape;

  // The bin width is the width of each bin in the heat map.
  binWidth: number;

  // The min value is the minimum value that the heat map tool can display.
  minValue: number;

  // The max value is the maximum value that the heat map tool can display.
  maxValue: number;

  // The inner heat node radius is the radius of the inner circle of the heat node.
  innerHeatNodeRadius: number;

  // The outer heat node radius is the radius of the outer circle of the heat node.
  outerHeatNodeRadius: number;

  // The min angle is the minimum angle of the heat map needle and heat nodes, in degrees.
  minAngle: number;

  // The max angle is the maximum angle of the heat map needle and heat nodes, in degrees.
  maxAngle: number;

  // The min labeled value is the minimum value that will be labeled on the heat map.
  minLabeledValue: number;

  // The max labeled value is the maximum value that will be labeled on the heat map.
  maxLabeledValue: number;

  // The labeled value increment is the increment between labeled values on the heat map.
  // This is also the increment between major tick marks.
  labeledValueIncrement: number;

  // The label distance is the labels' offset from the display origin.
  labelDistanceFromCenter: number;

  // The label min angle is the minimum angle of the labels relative to the minAngle, in degrees.
  labelMinAngle: number;

  // The label max angle is the maximum angle of the labels relative to the minAngle, in degrees.
  labelMaxAngle: number;

  // The value readout y is the y position of the value readout, relative to the display origin.
  valueReadoutY: number;

  // The majorTickMarkLength is the length of the major tick marks.
  majorTickMarkLength?: number;

  // The minorTickMarkIncrement is the increment between minor tick marks.
  minorTickMarkIncrement?: number;

  // The minorTickMarkLength is the length of the minor tick marks.
  minorTickMarkLength?: number;

  // This determines whether to show minor tick marks.
  isWithMinorTickMarks?: boolean;

  // This determines whether to show inner tick marks, between the labels and the display origin.
  isWithInnerTickMarks?: boolean;

  // This determines whether the values of the heat nodes are increasing clockwise or counterclockwise.
  isClockwise?: boolean;

  // This determines whether the heat map tool is an icon, which affects the layout of the value readout.
  isIcon?: boolean;
};

export type HeatMapToolNodeOptions = SelfOptions & NodeOptions;

export default class HeatMapToolNode extends Node {

  // minValue is the minimum value that the heat map tool can display.
  private readonly minValue: number;

  // maxValue is the maximum value that the heat map tool can display.
  private readonly maxValue: number;

  // binWidth is the width of each bin in the heat map, used to separate the data into bins.
  private readonly binWidth: number;

  // numValuesInBin is an array that stores the number of values in each bin.
  private readonly numValuesInBin: number[] = [];

  // heatNodes is an array of heat nodes, each with anopacity that represents the amount of data in the bin.
  protected readonly heatNodes: Path[] = [];

  // tickMarks is an array of major and minor tick marks.
  protected readonly tickMarks: Path[] = [];

  // labels is an array of numerical labels for the major increments on the heat map tool.
  protected readonly labels: Text[] = [];

  // The display node contains all the graphical elements of the heat map tool, excluding any connector graphics
  protected displayNode: Node;

  // bodyBackNode is the background of the heat map tool's display panel. It contains components that are behind the heat nodes.
  protected bodyBackNode: Path;

  // bodyFrontNode is the foreground of the heat map tool's display panel. It contains components that are in front of the heat nodes.
  protected bodyFrontNode: Path;

  // needleNode is the needle that points to the latest value on the heat map tool.
  protected readonly needleNode: Node;

  // valueReadoutNode is the node that contains the value readout, which displays the latest value.
  protected readonly valueReadoutNode: Node;

  // valueReadout is the text that displays the latest value.
  private readonly valueReadout: Text;

  // minAngle is the minimum angle used to set the angular positioning of the heat nodes, in degrees.
  private readonly minAngle: number;

  // maxAngle is the maximum angle used to set the angular positioning of the heat nodes, in degrees.
  private readonly maxAngle: number;

  // The latest value Property is used to update the heat map tool's needle rotation.
  public constructor( latestValueProperty: TReadOnlyProperty<number>, providedOptions: HeatMapToolNodeOptions ) {

    const options = optionize<HeatMapToolNodeOptions, SelfOptions, NodeOptions>()( {
      isWithMinorTickMarks: false,
      isWithInnerTickMarks: false,
      majorTickMarkLength: 0,
      minorTickMarkIncrement: 0,
      minorTickMarkLength: 0,
      isClockwise: false,
      isIcon: false
    }, providedOptions );
    super( options );

    this.minValue = options.minValue;
    this.maxValue = options.maxValue;
    this.binWidth = options.binWidth;

    // Calculate the number of heat nodes based on min, max and the bin width
    const numHeatNodes = Math.floor( ( this.maxValue - this.minValue ) / this.binWidth );

    // Initialize the number of values in each bin to 0
    for ( let i = 0; i < numHeatNodes; i++ ) {
      this.numValuesInBin.push( 0 );
    }

    this.displayNode = new Node( { x: options.displayOffset.x, y: options.displayOffset.y } );
    this.addChild( this.displayNode );

    const totalDeltaAngle = Math.abs( options.minAngle - options.maxAngle );
    const totalBins = ( options.maxValue - options.minValue ) / options.binWidth;
    const heatNodeArcLength = totalDeltaAngle / totalBins;

    // Create the initially transparent heat nodes
    this.heatNodes = options.isIcon ? [] : this.createHeatNodes( numHeatNodes, -options.minAngle, heatNodeArcLength,
      options.innerHeatNodeRadius, options.outerHeatNodeRadius, options.isClockwise );

    // Create the major tick mark labels
    this.labels = this.createLabels( options.minLabeledValue, options.maxLabeledValue, options.labeledValueIncrement,
      options.labelDistanceFromCenter, options.labelMinAngle, options.labelMaxAngle );

    // Create the major tick marks
    this.tickMarks = this.createMajorTickMarks( options.minLabeledValue, options.maxLabeledValue,
      options.labeledValueIncrement, options.labelMinAngle, options.labelMaxAngle, options.majorTickMarkLength,
      options.isWithInnerTickMarks, options.innerHeatNodeRadius, options.outerHeatNodeRadius );

    // If minor tick marks are enabled, create them
    if ( options.isWithMinorTickMarks ) {
      const minorTickMarks = this.createMinorTickMarks( options.minValue, options.maxValue, options.minAngle,
        options.maxAngle, options.minorTickMarkIncrement, options.minorTickMarkLength, options.outerHeatNodeRadius );
      this.tickMarks.push( ...minorTickMarks );
    }

    this.bodyBackNode = new Path( options.bodyShape, { fill: PDLColors.heatMapDisplayFillProperty } );
    this.bodyFrontNode = new Path( options.bodyShape, { stroke: PDLColors.heatMapDisplayStrokeProperty, lineWidth: 1 } );

    this.needleNode = this.createNeedleNode( options.needleShape );

    const formattedValueProperty = new DerivedProperty( [ latestValueProperty ], latestValue => {
      return Utils.toFixed( latestValue, 1 );
    } );

    const valueUnitsPatternStringProperty = new PatternStringProperty( options.readoutPatternStringProperty, {
      value: formattedValueProperty
    } );

    this.valueReadoutNode = new Node( { x: 0, y: options.valueReadoutY } );
    this.valueReadout = new PDLText( valueUnitsPatternStringProperty, {
      centerX: 0,
      centerY: 0,
      font: PDLConstants.PRIMARY_FONT,
      maxWidth: 50
    } );

    // Create a background rectangle for the value readout
    const valueReadoutBounds = this.valueReadout.bounds.dilatedXY( 8, 2 );
    const valueReadoutBackground = new Rectangle( valueReadoutBounds, {
      fill: '#ECECEC',
      stroke: 'black',
      lineWidth: 1,
      cornerRadius: 10
    } );

    this.valueReadoutNode.addChild( valueReadoutBackground );
    this.valueReadoutNode.addChild( this.valueReadout );

    // Position the value readout and its background
    ManualConstraint.create( this.valueReadoutNode, [ this.valueReadout ], valueReadoutProxy => {
      valueReadoutProxy.x = -0.5 * valueReadoutProxy.width;
      valueReadoutProxy.centerY = 0;
      const rectWidth = valueReadoutProxy.width + 16;
      valueReadoutBackground.setRectWidth( rectWidth );
      valueReadoutBackground.setRectX( -0.5 * rectWidth );
    } );

    // Add the graphical elements to the display node
    this.displayNode.addChild( this.bodyBackNode );
    this.heatNodes.forEach( heatNode => this.displayNode.addChild( heatNode ) );
    this.labels.forEach( label => this.displayNode.addChild( label ) );
    this.tickMarks.forEach( tickMark => this.displayNode.addChild( tickMark ) );
    this.displayNode.addChild( this.bodyFrontNode );
    this.displayNode.addChild( this.needleNode );

    if ( !options.isIcon ) {
      this.displayNode.addChild( this.valueReadoutNode );
    }

    this.minAngle = options.minAngle;
    this.maxAngle = options.maxAngle;

    // Update the needle rotation when the latest value changes
    latestValueProperty.link( latestValue => {
      this.setNeedleRotation( latestValue );
    } );
  }

  // setNeedleRotation sets the rotation of the needle node based on the latest value
  private setNeedleRotation( value: number ): void {
    const needleAngle = -Utils.linear( this.minValue, this.maxValue, this.minAngle, this.maxAngle, value );
    this.needleNode.setRotation( Utils.toRadians( needleAngle ) );
  }

  // createHeatNodes creates the heat nodes that represent the heat map tool's data
  private createHeatNodes( numHeatNodes: number, minAngle: number, heatNodeArcLength: number, innerRadius: number, outerRadius: number, isClockwise: boolean ): Path[] {
    const heatNodes = [];

    const outerCircle = new Shape().arc( 0, 0, outerRadius, Utils.toRadians( -heatNodeArcLength / 2 ),
      Utils.toRadians( heatNodeArcLength / 2 ) ).lineTo( 0, 0 );
    const innerCircle = new Shape().arc( 0, 0, innerRadius, Utils.toRadians( -heatNodeArcLength / 2 ),
      Utils.toRadians( heatNodeArcLength / 2 ) ).lineTo( 0, 0 );
    const heatNodeShape = outerCircle.shapeDifference( innerCircle ).close();

    for ( let i = 0; i < numHeatNodes; i++ ) {
      const heatNode = new Path( heatNodeShape, {
        opacity: 0,
        fill: PDLColors.heatNodeFillProperty
      } );

      const deltaAngle = ( 0.5 + i ) * heatNodeArcLength;
      const heatNodeAngle = isClockwise ? minAngle + deltaAngle : minAngle - deltaAngle;

      heatNode.rotateAround( Vector2.ZERO, Utils.toRadians( heatNodeAngle ) );
      heatNodes.push( heatNode );
    }

    return heatNodes;
  }

  // createLabels creates the numerical labels for the major increments on the heat map tool
  private createLabels( minLabeledValue: number, maxLabeledValue: number, labeledValueIncrement: number,
                        labelDistanceFromCenter: number, labelMinAngle: number, labelMaxAngle: number ): Text[] {
    const labels = [];

    for ( let i = minLabeledValue; i <= maxLabeledValue; i += labeledValueIncrement ) {
      const labelAngle = Utils.linear( minLabeledValue, maxLabeledValue, labelMinAngle, labelMaxAngle, i );
      const label = new PDLText( i.toString(), {
        centerX: labelDistanceFromCenter * Math.cos( Utils.toRadians( -labelAngle ) ),
        centerY: labelDistanceFromCenter * Math.sin( Utils.toRadians( -labelAngle ) ),
        font: PDLConstants.HEATMAP_TOOL_LABEL_FONT
      } );
      labels.push( label );
    }

    return labels;
  }

  // createMajorTickMarks creates the major tick marks for the heat map tool
  private createMajorTickMarks( minLabeledValue: number, maxLabeledValue: number, labeledValueIncrement: number,
                                labelMinAngle: number, labelMaxAngle: number, majorTickMarkLength: number,
                                isWithInnerTickMarks: boolean, innerRadius: number, outerRadius: number ): Path[] {
    const majorTickMarks: Path[] = [];

    for ( let i = minLabeledValue; i <= maxLabeledValue; i += labeledValueIncrement ) {
      const angle = Utils.linear( minLabeledValue, maxLabeledValue, labelMinAngle, labelMaxAngle, i );
      const tickMarkAngle = Utils.toRadians( -angle );
      const outerMajorTickMark = new Path( new Shape().moveTo( outerRadius - majorTickMarkLength, 0 ).lineTo( outerRadius, 0 ), {
        stroke: PDLColors.heatMapDisplayStrokeProperty,
        lineWidth: 1
      } );
      outerMajorTickMark.rotateAround( Vector2.ZERO, tickMarkAngle );
      majorTickMarks.push( outerMajorTickMark );

      if ( isWithInnerTickMarks ) {
        const innerMajorTickMark = new Path( new Shape().moveTo( innerRadius, 0 ).lineTo( innerRadius + majorTickMarkLength, 0 ), {
          stroke: PDLColors.heatMapDisplayStrokeProperty,
          lineWidth: 1
        } );
        innerMajorTickMark.rotateAround( Vector2.ZERO, tickMarkAngle );
        majorTickMarks.push( innerMajorTickMark );
      }
    }

    return majorTickMarks;
  }

  // createMinorTickMarks creates the minor tick marks for the heat map tool
  private createMinorTickMarks( minValue: number, maxValue: number, minAngle: number, maxAngle: number, minorTickMarkIncrement: number,
                                minorTickMarkLength: number, outerRadius: number ): Path[] {
    const minorTickMarks: Path[] = [];

    for ( let i = minValue; i <= maxValue; i += minorTickMarkIncrement ) {
      const angle = Utils.linear( minValue, maxValue, minAngle, maxAngle, i );
      const tickMarkAngle = Utils.toRadians( -angle );
      const minorTickMark = new Path( new Shape().moveTo( outerRadius - minorTickMarkLength, 0 ).lineTo( outerRadius, 0 ), {
        stroke: PDLColors.heatMapDisplayStrokeProperty,
        lineWidth: 1
      } );
      minorTickMark.rotateAround( Vector2.ZERO, tickMarkAngle );
      minorTickMarks.push( minorTickMark );
    }

    return minorTickMarks;
  }

  // createNeedleNode creates the needle node for the heat map tool
  private createNeedleNode( needleShape: Shape ): Node {
    const needleNode = new Path( needleShape, {
      fill: PDLColors.heatMapNeedleFillProperty,
      stroke: PDLColors.heatMapNeedleStrokeProperty,
      lineWidth: 1,
      x: 0,
      y: 0
    } );
    return needleNode;
  }

  // updateHeatMapWithData updates the opacity of each heat node based on the number of values in the bin.
  // The minimum opacity is 0.2, and the bin with the largest number of values has an opacity of 1.
  // The opacity of each heat node is scaled based on the number of values in the bin relative to the bin with the
  // largest number of values.
  public updateHeatMapWithData( data: number ): void {
    const minOpacity = 0.2;
    const index = Math.floor( ( data - this.minValue ) / this.binWidth );

    let maxNumValuesInBin = 0;

    if ( this.numValuesInBin[ index ] !== undefined ) {
      this.numValuesInBin[ index ]++;
      maxNumValuesInBin = Math.max( ...this.numValuesInBin );

      // If the bin is empty, set the opacity to 0
      // If the bin has values, set the opacity to minOpacity + (1-minOpacity) * (# values in bin) / (largest # values in any bin)
      for ( let i = 0; i < this.heatNodes.length; i++ ) {
        if ( this.heatNodes[ i ] !== null ) {
          const opacityToSet = this.numValuesInBin[ i ] === 0 ? 0 : minOpacity + ( 1 - minOpacity ) * this.numValuesInBin[ i ] / maxNumValuesInBin;
          this.heatNodes[ i ].opacity = Utils.clamp( opacityToSet, 0, 1 ); // to avoid floating point errors
        }
      }
    }
  }

  // Clear the heat map tool by setting the opacity of each heat node to 0
  public clear(): void {
    this.numValuesInBin.forEach( ( value, index ) => {
      this.numValuesInBin[ index ] = 0;
      this.heatNodes[ index ].opacity = 0;
    } );
  }
}

projectileDataLab.register( 'HeatMapToolNode', HeatMapToolNode );