{-
Welcome to a Spago project!
You can edit this file as you like.

Need help? See the following resources:
- Spago documentation: https://github.com/purescript/spago
- Dhall language tour: https://docs.dhall-lang.org/tutorials/Language-Tour.html

When creating a new Spago project, you can use
`spago init --no-comments` or `spago init -C`
to generate this file without the comments in this block.
-}
{ name = "my-project"
, dependencies =
  [ "aff"
  , "aff-promise"
  , "argonaut"
  , "argonaut-core"
  , "arrays"
  , "console"
  , "control"
  , "effect"
  , "either"
  , "foldable-traversable"
  , "functions"
  , "identity"
  , "lists"
  , "maybe"
  , "newtype"
  , "node-buffer"
  , "node-fs"
  , "node-path"
  , "node-process"
  , "nonempty"
  , "ordered-collections"
  , "partial"
  , "pipes"
  , "prelude"
  , "psci-support"
  , "quickcheck"
  , "safe-coerce"
  , "spec"
  , "string-parsers"
  , "strings"
  , "stringutils"
  , "tailrec"
  , "transformers"
  , "tuples"
  , "typelevel"
  , "validation"
  ]
, packages = ./packages.dhall
, sources = [ "src/**/*.purs", "test/**/*.purs" ]
}
