import { baseType }            from '@itrocks/class-type'
import { ObjectOrType }        from '@itrocks/class-type'
import { decorateCallback }    from '@itrocks/decorator/class'
import { decoratorOfCallback } from '@itrocks/decorator/class'
import { toDisplay }           from '@itrocks/rename'

const DISPLAY = Symbol('display')

export function Display(name = '')
{
	return decorateCallback(DISPLAY, target => toDisplay(name.length ? name : target.name))
}

export function displayOf<T extends object>(target: ObjectOrType<T>)
{
	return decoratorOfCallback<T, string>(target, DISPLAY, target => toDisplay(baseType(target).name))
}
