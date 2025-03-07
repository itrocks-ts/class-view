import { KeyOf, ObjectOrType, Type, typeOf }     from '@itrocks/class-type'
import { decorateCallback, decoratorOfCallback } from '@itrocks/decorator/class'
import { ReflectClass }                          from '@itrocks/reflect'

export type Dependencies = {
	requiredOf: <T extends object>(target: Type<T>, property: KeyOf<T>) => boolean
}

const depends: Dependencies = {
	requiredOf: () => true
}

const REPRESENTATIVE = Symbol('representative')

export function classRepresentativeDependsOn(dependencies: Partial<Dependencies>)
{
	Object.assign(depends, dependencies)
}

export function Representative<T extends object>(...properties: KeyOf<T>[])
{
	return decorateCallback<T>(REPRESENTATIVE, target => {
		if (target.prototype.toString === Object.prototype.toString) {
			Object.defineProperty(target.prototype, 'toString', {
				configurable: true,
				enumerable:   false,
				value:        function() { return representativeValueOf<T>(this) },
				writable:     true
			})
		}
		return properties.length
			? properties
			: new ReflectClass(target).propertyNames.filter(name => depends.requiredOf(target, name))
	})
}

export function representativeOf<T extends object>(target: ObjectOrType<T>): KeyOf<T>[]
{
	const result = decoratorOfCallback<T, KeyOf<T>[]>(target, REPRESENTATIVE)
	if (result) return result
	Representative()(typeOf(target))
	return representativeOf<T>(target)
}

export function representativeValueOf<T extends object>(target: T)
{
	return representativeOf<T>(target)
		.map(property => target[property])
		.filter(value => (value + '').length)
		.join(' ')
}
