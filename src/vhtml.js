import emptyTags from './empty-tags';

// escape an attribute
let esc = str => String(str).replace(/[&<>"']/g, s=>`&${map[s]};`);
let map = {'&':'amp','<':'lt','>':'gt','"':'quot',"'":'apos'};
let DOMAttributeNames = {
	className: 'class',
	htmlFor: 'for'
};

let sanitized = {};

/** Hyperscript reviver that constructs a sanitized HTML string. */
export default function h(name, attrs) {
	let stack=[];
	for (let i=arguments.length; i-- > 2; ) {
		stack.push(arguments[i]);
	}

	// Sortof component support!
	if (typeof name==='function') {
		(attrs || (attrs = {})).children = stack.reverse();
		return name(attrs);
		// return name(attrs, stack.reverse());
	}

	let innerHTML = null;

	let s = name ? `<${name}` : '';
	if (attrs) for (let i in attrs) {
		if (attrs[i]!==false && attrs[i]!=null) {
			if (i.toLowerCase() === 'dangerouslysetinnerhtml') {
				innerHTML = attrs[i].__html ? attrs[i].__html : '';
			} else {
				s += ` ${DOMAttributeNames[i] ? DOMAttributeNames[i] : esc(i)}="${esc(attrs[i])}"`;
			}
		}
	}

	if (emptyTags.indexOf(name) === -1) {
		s += name ? '>' : '';

		if (innerHTML === null) {
			while (stack.length) {
				let child = stack.pop();
				if (child) {
					if (child.pop) {
						for (let i=child.length; i--; ) stack.push(child[i]);
					}
					else {
						s += sanitized[child]===true ? child : esc(child);
					}
				}
			}
		} else {
			s += innerHTML;
		}

		s += name ? `</${name}>` : '';
	} else {
		s += name ? '>' : '';
	}

	sanitized[s] = true;
	return s;
}
