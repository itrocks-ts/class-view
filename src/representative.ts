import { KeyOf, ObjectOrType, Type, typeOf }     from '@itrocks/class-type'
import { decorateCallback, decoratorOfCallback } from '@itrocks/decorator/class'
import { ReflectClass }                          from '@itrocks/reflect'

export type Dependencies = {
	propertyOutput: <T extends object>(object: T, property: KeyOf<T>) => Promise<string>,
	requiredOf:     <T extends object>(target: Type<T>, property: KeyOf<T>) => boolean
}

const depends: Dependencies = {
	propertyOutput: async (object, property) => '' + await object[property],
	requiredOf:     () => true
}

const REPRESENTATIVE = Symbol('representative')

export function classRepresentativeDependsOn(dependencies: Partial<Dependencies>)
{
	Object.assign(depends, dependencies)
}

export function Representative<T extends object>(...properties: KeyOf<T>[])
{
	return decorateCallback<T>(REPRESENTATIVE, target => {
		if (properties.length) return properties
		try {
			properties = new ReflectClass(target).propertyNames
		}
		catch(error) {
			console.log('@itrocks/representative called `new ReflectClass(', target, ')` but it crashed:')
			console.warn(error)
		}
		const required = properties.filter(name => depends.requiredOf(target, name))
		if (required.length) return required
		return properties.slice(0, 3)
	})
}

export function representativeOf<T extends object>(target: ObjectOrType<T>): KeyOf<T>[]
{
	const result = decoratorOfCallback<T, KeyOf<T>[]>(target, REPRESENTATIVE)
	if (result) return result
	Representative()(typeOf(target))
	return representativeOf<T>(target)
}

export async function representativeValueOf(target: object)
{
	return (await Promise.all(
		representativeOf(target).map(async property => await depends.propertyOutput(target, property))
	))
		.filter(async value => ('' + value).length)
		.join(' ')
}
