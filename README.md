[![npm version](https://img.shields.io/npm/v/@itrocks/class-view?logo=npm)](https://www.npmjs.org/package/@itrocks/class-view)
[![npm downloads](https://img.shields.io/npm/dm/@itrocks/class-view)](https://www.npmjs.org/package/@itrocks/class-view)
[![GitHub](https://img.shields.io/github/last-commit/itrocks-ts/class-view?color=2dba4e&label=commit&logo=github)](https://github.com/itrocks-ts/class-view)
[![issues](https://img.shields.io/github/issues/itrocks-ts/class-view)](https://github.com/itrocks-ts/class-view/issues)
[![discord](https://img.shields.io/discord/1314141024020467782?color=7289da&label=discord&logo=discord&logoColor=white)](https://25.re/ditr)

# class-view

Decorators for user-friendly identification of domain classes and objects.

*This documentation was written by an artificial intelligence and may contain errors or approximations.
It has not yet been fully reviewed by a human. If anything seems unclear or incomplete,
please feel free to contact the author of this package.*

## Installation

```bash
npm i @itrocks/class-view
```

## Usage

`@itrocks/class-view` provides a small set of decorators and helpers to give
your domain classes a user‑friendly, localised textual representation.

You typically use:

- `@Display()` to define the human‑readable name of a class,
- `@Representative()` to choose which properties best identify an instance,
- `outputOf()` / `trOutputOf()` to build consistent labels for objects.

### Minimal example

```ts
import {
	Display,
	Representative,
	outputOf
} from '@itrocks/class-view'

@Display('Movie')
@Representative('title')
class Movie
{
	title = ''
}

async function label(movie: Movie)
{
	console.log(await outputOf(movie)) // "Movie <title>"
}
```

### Integrated example

In a more realistic scenario, you combine `@Display` and
`@Representative` on domain/query classes, and optionally configure
dependencies so that `outputOf` can use your own translation and
property‑formatting functions.

```ts
import {
	Display,
	Representative,
	classViewDependsOn,
	outputOf,
	trOutputOf
} from '@itrocks/class-view'

// Configure translations and property output once at application startup
classViewDependsOn({
	// Translate labels
	tr: text => i18n.translate(text),
	// Format a property as text (can use other view helpers)
	propertyOutput: async (object, property) => {
		const value = (object as any)[property]
		return value == null ? '' : String(value)
	},
	// Decide which properties are considered "required" for identification
	requiredOf: (type, property) => type.name === 'Movie' && property === 'title'
})

@Display('Search for a movie')
@Representative('title')
class MovieQuery
{
	title = ''
}

async function showQueries(queries: MovieQuery[])
{
	for (const query of queries) {
		// Uses configured `tr` and `propertyOutput`
		console.log(await trOutputOf(query))
	}
}
```

## API

`@itrocks/class-view` exposes the following public elements:

- Configuration helpers:
	- `classOutputDependsOn(dependencies)`
	- `classRepresentativeDependsOn(dependencies)`
	- `classViewDependsOn(dependencies)`
- Display helpers:
	- `@Display(name?)`
	- `displayOf(target)`
- Representative helpers:
	- `@Representative(...properties)`
	- `representativeOf(target)`
	- `representativeValueOf(target)`
- Output helpers:
	- `outputOf(target)`
	- `trOutputOf(target)`

Below is a more detailed description of each symbol.

### Configuration helpers

#### `classOutputDependsOn(dependencies)`

```ts
import { classOutputDependsOn } from '@itrocks/class-view'

classOutputDependsOn({
	tr: text => translate(text)
})
```

Registers process-wide dependencies used by `trOutputOf` to translate
display labels.

- `partial.tr` – Function that receives a label (for example the
  return value of `displayOf`) and returns its translated version.

If you do not configure anything, `tr` defaults to the identity
function (no translation).

#### `classRepresentativeDependsOn(dependencies)`

```ts
import { classRepresentativeDependsOn } from '@itrocks/class-view'

classRepresentativeDependsOn({
	propertyOutput: async (object, property) => '' + await (object as any)[property],
	requiredOf:     () => true
})
```

Configures how `@Representative`, `representativeOf` and
`representativeValueOf` determine and format the properties that
identify an object.

You can override:

- `propertyOutput` – Asynchronously convert a property value to a
  string (default: `'' + await object[property]`).
- `requiredOf` – Decide whether a property is considered *required*
  (default: always `true`). Required properties are preferred when
  choosing representative fields.

#### `classViewDependsOn(dependencies)`

```ts
import { classViewDependsOn } from '@itrocks/class-view'

classViewDependsOn({
	tr:            text => translate(text),
	propertyOutput: async (object, property) => '' + await (object as any)[property],
	requiredOf:     () => true
})
```

Convenience helper that calls both `classOutputDependsOn` and
`classRepresentativeDependsOn` with the same `dependencies` object.

### Display helpers

#### `@Display(name?)`

```ts
import { Display } from '@itrocks/class-view'

@Display('Movie')
class Movie {}
```

Class decorator that sets a user‑friendly name for a domain class.

- `name?: string` – Optional label. When provided, it is used verbatim
  (usually passed through `@itrocks/rename` for formatting). When
  omitted or empty, the class name is converted into a readable label.

This label is later used by `displayOf`, `outputOf`, `trOutputOf` and
any other tools that rely on `@itrocks/rename`.

#### `displayOf(target)`

```ts
import { displayOf } from '@itrocks/class-view'

const label = displayOf(Movie) // e.g. 'Movie'
```

Returns the display label for a class or instance:

- If `@Display` was used, returns the configured label.
- Otherwise, falls back to a label derived from the class name.

`target` can be either the constructor or an instance.

### Representative helpers

#### `@Representative(...properties)`

```ts
import { Representative } from '@itrocks/class-view'

@Representative('title', 'year')
class Movie
{
	title = ''
	year  = 0
}
```

Class decorator that marks which properties of a class best identify an
instance.

- `...properties: (keyof T)[]` – One or more property names.

If you do not pass any property names, the decorator will try to
inspect the class using `@itrocks/reflect` to discover its properties,
then select:

- all properties considered *required* by `requiredOf`, or
- the first three properties if none are required.

#### `representativeOf(target)`

```ts
import { representativeOf } from '@itrocks/class-view'

const props = representativeOf(Movie) // e.g. ['title']
```

Returns the list of property names marked as representative for a
class or instance. If `@Representative` has not yet been applied to the
class, it is applied lazily with the default discovery rules described
above.

#### `representativeValueOf(target)`

```ts
import { representativeValueOf } from '@itrocks/class-view'

const text = await representativeValueOf(movie)
```

Asynchronously builds a string that concatenates the textual values of
all representative properties of `target`, using `propertyOutput` for
each property and joining non‑empty results with spaces.

### Output helpers

#### `outputOf(target)`

```ts
import { outputOf } from '@itrocks/class-view'

const text = await outputOf(movie)
```

Builds a label combining the display name and the representative
properties of a class or instance.

- If `target` is an object instance, the result is:
  - `"<display> <representative values>"` when representative
    properties are defined,
  - or just `"<display>"` otherwise.
- If `target` is a constructor, only the display label is returned.

#### `trOutputOf(target)`

```ts
import { trOutputOf } from '@itrocks/class-view'

const text = await trOutputOf(movie)
```

Same as `outputOf`, but passes the display label through the configured
`tr` function from `classOutputDependsOn` / `classViewDependsOn` before
building the final string. This is typically used to localise class
names while keeping property values as they are.

## Typical use cases

- Giving consistent, human‑friendly labels to domain classes across an
  application (forms, lists, logs, admin screens…).
- Automatically picking the most relevant properties to identify an
  object when displaying it in a grid, search results, or dropdown.
- Centralising translation (`tr`) and property formatting
  (`propertyOutput`) rules used by higher‑level UI modules.
- Building readable labels for logs or debug output without repeating
  formatting code.
