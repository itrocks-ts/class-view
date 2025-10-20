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

export async function outputOf(target: ObjectOrType)
{
	return isObject(target)
		? (displayOf(target) + ' ' + await representativeValueOf(target))
		: displayOf(target)
}

export async function trOutputOf(target: ObjectOrType)
{
	return isObject(target)
		? (depends.tr(displayOf(target)) + ' ' + await representativeValueOf(target))
		: depends.tr(displayOf(target))
}
