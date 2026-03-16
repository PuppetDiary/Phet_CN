// Copyright 2023-2024, University of Colorado Boulder

/**
 * Represents values that can be depicted in the histogram. For the first 3 screens, the data for the histogram is one
 * Projectile, which has a single x value, where the projectile landed, in meters. For the sampling screen, a
 * HistogramData is the mean of the x values for the projectiles in the sample.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
type HistogramData = {
  x: number;
};

export default HistogramData;