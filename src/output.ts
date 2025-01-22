import { isObject, ObjectOrType } from '@itrocks/class-type'
import { displayOf }              from './display'
import { representativeValueOf }  from './representative'

export type Dependencies = {
	tr: (text: string) => string
}

const depends: Dependencies = {
	tr: text => text
}

export function classOutputDependsOn(dependencies: Partial<Dependencies>)
{
	Object.assign(depends, dependencies)
}

export const outputOf = (target: ObjectOrType) => isObject(target)
	? (displayOf(target) + ' ' + representativeValueOf(target))
	: displayOf(target)

export const trOutputOf = (target: ObjectOrType) => isObject(target)
	? (depends.tr(displayOf(target)) + ' ' + representativeValueOf(target))
	: depends.tr(displayOf(target))
