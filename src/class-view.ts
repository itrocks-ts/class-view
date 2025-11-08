import { Dependencies as OutputDependencies }         from './output'
import { classOutputDependsOn }                       from './output'
import { Dependencies as RepresentativeDependencies } from './representative'
import { classRepresentativeDependsOn }               from './representative'

export {
	classOutputDependsOn,
	classRepresentativeDependsOn
}

export function classViewDependsOn(dependencies: OutputDependencies & RepresentativeDependencies)
{
	classOutputDependsOn(dependencies)
	classRepresentativeDependsOn(dependencies)
}

export {
	Display,
	displayOf
} from './display'

export {
	outputOf,
	trOutputOf
} from './output'

export {
	Representative,
	representativeOf,
	representativeValueOf
} from './representative'
