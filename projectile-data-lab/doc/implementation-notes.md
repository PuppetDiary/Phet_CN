# Projectile Data Lab - Implementation Notes

## Architecture and Design

The simulation is structured around a model/view architecture, separating the physics and statistics modeling (model)
from the graphical representation (view).

### Screens

The first three screens are called Variability, Sources and Measurement. These screens are very similar to each other
and hence in several places in the code are handled together under the term "VSM", short for Variability, Sources and
Measurement. There is additional code that only pertains to the Sources and Measurements screens--this combination is
abbreviated as "SM" in the code. The Sampling screen is more about firing a complete sample at once, rather than
individual projectiles.

Please note due to the similarity of the VSM screens, the code is often shared between them. This is accomplished via a
new folder structure like so:

```
common/
  model/
  view/
common-vsm/
  model/
  view/
```

Please see where this was discussed in https://github.com/phetsims/projectile-data-lab/issues/197

### Scenes

This simulation has a notion of scenes where each scene contains its own state data. The scenes in this simulation are
called `Field`s. The models that contain `Field[]` also provide `DynamicProperty` to present the value of the selected
Field. Note the VSM screens have an independently selectable `Field` whereas on the Sampling screen, the `SamplingField`
is determined by the selection of mystery launcher and sample size.

### DynamicProperty Instances

The simulation is implemented with DynamicProperty, which allows values to switch based on another selected Property.
For instance:

- The PDLModel has DynamicProperty instances for the selected Field.
- The Field has DynamicProperty instances for the selected Launcher.
- The Launcher has DynamicProperty instances for its selected LauncherMechanism.
- There are more in the screen-specific subclasses.

Please search for `DynamicProperty` in the code to see how it is used.

### Enumeration patterns

For simulation-specific enumerations, we use the string literal union pattern. See LauncherOrientation.ts for an
example.

### Disposal

Everything in the simulation is statically allocated, exists for the lifetime of the simulation, and there is no need
for disposal. Rather than marking `isDisposable: false` in many files or calling `Disposable.assertNotDisposable`,
instead we prevent the usage of the term `dispose` with a linter rule specified in the package.json.

```json
"phet/additional-bad-text": ["error", {"forbiddenTextObjects": ["dispose"] }]
```

If this code is moved to common code, then this approach for disposal will need to be re-evaluated.

### Strings

The string keys are designed as a camel-cased version of the English translation as of the 1.0 release. For example:

```json
"binWidthMPattern": {
"value": "{{binWidth}} m"
}
```

Note that if the English strings are changed after 1.0, the keys will not be updated.

### Inner classes

For this simulation, for trivial classes that are only used by one class, we sometimes use inner classes. For example,
search for
`class MeasuringTapeIconNode`. This allows us to keep code co-located with where it is used, without proliferating
files, and to have a usage site like `new MeasuringTapeIconNode()`.

### Sonfication (sound)

Sonification is implemented in the model, since it is often triggered directly by model events, rather than through a
listener abstraction.

### PhET-iO

For this simulation, individual projectiles are not PhET-iO instrumented. Instead, the parent Field is instrumented.
Please see FieldIO which describes how the serialization is implemented. Note however that ProjectileIO defines how a
Projectile is serialized as part of the Field serialization.

A flat structure is chosen for the design of the ProjectileIO, so that it can be easily serialized and deserialized. The
same data structure for ProjectileIO is used in the VSM screens and the Sampling screen, to keep a simple interface for
PhET-iO clients.

## Performance

Good performance is critical in this simulation, and has led to several implementation decisions such as:

1. Objects are not dynamically allocated, and are instead statically allocated.
2. View elements are created only once, and are re-used to represent different Fields or Launchers based on the result
   of a `DynamicProperty`.
3. The simulation is designed to be able to handle a large number of projectiles, and to be able to run at a high frame
   rate.
4. Methods to render the heat maps are optimized to support updating based on a single value being added, where
   appropriate (rather than re-rendering the entire object). In some cases (such as the Histogram), where re-rendering
   the entire object is fast enough, we do that instead.
