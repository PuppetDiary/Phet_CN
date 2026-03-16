# Projectile Data Lab - Model Description

## Overview

This simulation enables exploration of both physics and statistical principles, through the backdrop of the
familiar "projectile motion" context, with real-world data. The simulation introduces random initial conditions 
in the launch angle and speed, and shows the distribution of the resulting trajectory. The simulation features
statistical elements such as mean, standard deviation, and sampling distributions. The data can be viewed in a
histogram or analyzed with various tools.

## Physical Model

In the absence of air resistance, the simulation ensures that the projectiles follow perfect parabolic paths, allowing
for analytical computation. The motion of these projectiles is characterized by their initial position (`y_0`), launch
angle (`theta`), initial velocity (`v_0`), and the time they spend airborne. The equations governing this motion are:

- For vertical motion: `y = y_0 + v_0 * sin(theta) * t - 1/2 * g * t^2`
- For horizontal motion: `x = v_0 * cos(theta) * t`

where `g` represents the acceleration due to gravity, and `t` denotes time. where \(g\) represents the acceleration due
to gravity, and \(t\) denotes time.

Through interactive exploration, users gain insights into how variables such as launch speed and angle affect projectile
motion. The simulation's tools facilitate both visual and numerical analyses, enhancing the understanding of how
randomness and variability play crucial roles in physical phenomena.

## Statistical Model

The simulation employs normal distributions to determine the launch speed and launch angle of each projectile. These values
are generated from independent distributions, each with mean and standard deviation that depend on the launcher orientation,
launcher type and/or the projectile type. See the [Orientation](#orientation), [Launchers](#launchers), 
and [Projectiles](#projectiles) sections for more details.

By incorporating statistical analyses such as calculating the mean (average distance of projectiles), standard
deviation (variation in distances), and sampling (examining different "samples" of projectile launches), the simulation
bridges the gap between theoretical physics and applied statistics.

## Orientation

The launcher orientation determines the initial height and the mean launch angle of launched projectiles. It can take
on the following values:
* **Ground level - 30 degrees**: The projectiles have an initial height of 0 meters, and a mean launch angle of 30 degrees.
* **Ground level - 45 degrees**: The projectiles have an initial height of 0 meters, and a mean launch angle of 45 degrees.
* **Ground level - 60 degrees**: The projectiles have an initial height of 0 meters, and a mean launch angle of 60 degrees.
* **Raised - 0 degrees**: The projectiles have an initial height of 12 meters, and a mean launch angle of 0 degrees.

## Launchers

Each launcher is defined by its `launch mechanism` as well as its `angle stability`. The launch mechanism determines the
distribution of launch speeds, while the angle stability determines the variability of the launch angle. The launch mechanism
can be one of the following:

* **Spring**: The launch speeds are normally distributed with a mean of 23 m/s and a standard deviation of 0.5 m/s.
* **Pressure**: The launch speeds are normally distributed with a mean of 24 m/s and a standard deviation of 0.2 m/s.
* **Explosion**: The launch speeds are normally distributed with a mean of 25 m/s and a standard deviation of 1.2 m/s.
* **Custom Mechanisms 1-3**: The launch speed mean and standard deviation are user-defined.

The `angle stability` value corresponds to the slider position of the angle stability control. A value of 0 corresponds to
the minimum angle stability, while a value of 1 corresponds to the maximum angle stability.

## Projectiles

Each projectile type has a unique mass which affects its mean launch speed. This is reflected in the simulation by the
`speedMultiplierProperty` for each type of projectile. The projectile types are defined as follows:

* **Cannonball**: The standard projectile with a speed multiplier of 1.
* **Pumpkin**: A lighter projectile with a speed multiplier of 1.1.
* **Piano**: A heavier projectile with a speed multiplier of 0.9.