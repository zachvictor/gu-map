# GuMap — 固Map
固 _is strong, solid, and sure—an allusion to this class’s immutability-features._

_**What is GuMap? What does it do?**_ \
GuMap is a JavaScript class that extends the Map prototype to support dot accessor notation and immutability features. Unlike Map, GuMap can be configured to throw errors on state mutation.

_**What value does GuMap add?**_ \
Dot accessor notation is idiomatic and concise. Immutability can protect against unwanted state mutation. A Map that supports immutable properties may be able to serve compositional strategies that draw on functional programming patterns. Throwing an error on state mutation can help pinpoint logical errors quickly and prevent a mutated variable from "metastasizing" into a bigger problem.

_**How is GuMap implemented?**_ \
The GuMap class extends Map. Its constructor returns a Proxy, which is used to implement immutability, dot accessor notation for get and set, and "bridges" to standard Map properties. The GuMap class does not bridge `Map[@@iterator]`. Please use entries() instead.

_**What is the GuMapConfig class for?**_ \
The GuMapConfig class structures the parameter object of the GuMap constructor. It helps humans and machines "understand" the parameterization, the one for practical purposes, the other (typically) for static code analysis.

_**What’s in a name?**_ \
The name “GuMap” is a bilingual compound word, transliterating 固Map (_gù-map_) into Latin letters.
