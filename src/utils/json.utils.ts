// Ported from https://github.com/douglascrockford/JSON-js/blob/master/cycle.js

// Normally schemas will be decycled on the server and retrocycled on the client.

export function retrocycle ($: unknown, refKey = '__ref__'): unknown {
  // Restore an object that was reduced by decycle. Members whose values are
  // objects of the form
  //      {__ref__: PATH}
  // are replaced with references to the value found by the PATH. This will
  // restore cycles. The object will be mutated.

  // The eval function is used to locate the values described by a PATH. The
  // root object is kept in a $ variable. A regular expression is used to
  // assure that the PATH is extremely well formed. The regexp contains nested
  // * quantifiers. That has been known to have extremely bad performance
  // problems on some browsers for very long strings. A PATH is expected to be
  // reasonably short. A PATH is allowed to belong to a very restricted subset of
  // Goessner's JSONPath.

  // So,
  //      let s = '[{"__ref__":"$"}]';
  //      return JSON.retrocycle(JSON.parse(s));
  // produces an array containing a single element which is the array itself.

  const px = /^\$(?:\[(?:\d+|"(?:[^\\"\u0000-\u001f]|\\(?:[\\"\/bfnrt]|u[0-9a-zA-Z]{4}))*")\])*$/
  ;(function rez (value: unknown) {
    // The rez function walks recursively through the object looking for __ref__
    // properties. When it finds one that has a value that is a path, then it
    // replaces the __ref__ object with a reference to the value that is found by
    // the path.

    if (value && typeof value === 'object') {
      if (Array.isArray(value)) {
        value.forEach(function (element, i) {
          if (typeof element === 'object' && element !== null) {
            const path = element[refKey]
            if (typeof path === 'string' && px.test(path)) {
              try {
                value[i] = eval(path)
              } catch (e) {}
            } else {
              rez(element)
            }
          }
        })
      } else if (value) {
        Object.keys(value).forEach(function (name: string) {
          const item = (value as Record<string, unknown>)[name]
          if (typeof item === 'object' && item !== null) {
            const path = (item as Record<string, unknown>)[refKey]
            if (typeof path === 'string' && px.test(path)) {
              try {
                ;(value as Record<string, unknown>)[name] = eval(path)
              } catch (e) {}
            } else {
              rez(item)
            }
          }
        })
      }
    }
  })($)
  return $
}
