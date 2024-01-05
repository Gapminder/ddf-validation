module Data.DDF.Concept where

import Prelude

import Data.Array as A
import Data.Array.NonEmpty (NonEmptyArray)
import Data.Array.NonEmpty as Narr
import Data.DDF.Csv.FileInfo (FileInfo(..))
import Data.DDF.Csv.FileInfo as FI
import Data.DDF.Internal (ItemInfo)
import Data.DDF.Atoms.Identifier (Identifier)
import Data.DDF.Atoms.Identifier as Id
import Data.Validation.Issue (Issues, Issue(..))
import Data.Validation.ValidationT (Validation, vError, vWarning)
import Data.Either (Either(..))
import Data.List (List(..), concatMap, elem, elemIndex, length, zip)
import Data.List as L
import Data.List.NonEmpty (NonEmptyList)
import Data.List.NonEmpty as NL
import Data.Map (Map, delete, fromFoldable, lookup, pop)
import Data.Map as M
import Data.Map.Extra (mapKeys)
import Data.Maybe (Maybe(..), isNothing)
import Data.Newtype (unwrap, class Newtype)
import Data.String as Str
import Data.String.NonEmpty.Internal (NonEmptyString(..), toString)
import Data.Traversable (for, traverse)
import Data.Tuple (Tuple(..), fst)
import Data.Validation.Semigroup
import Data.Validation.Semigroup (V, invalid)
import Data.DDF.Atoms.Header (parseHeader, createHeader, Header(..), headerVal)

-- | Each Concept MUST have an Id and concept type.
-- Other properties is a Map
newtype Concept = Concept
  { conceptId :: Identifier
  , conceptType :: ConceptType
  , props :: Props
  , _info :: Maybe ItemInfo -- additional information used in the app, not in DDF data model
  }

instance eqConcept :: Eq Concept where
  eq (Concept a) (Concept b) = a.conceptId == b.conceptId

instance showConcept :: Show Concept where
  show (Concept a) = show a

-- | Properties type
-- the Key MUST be valid identifier
type Props = Map Identifier String

-- | Types of concept
data ConceptType
  = StringC
  | MeasureC
  | BooleanC
  | IntervalC
  | EntityDomainC
  | EntitySetC
  | RoleC
  | CompositeC
  | TimeC
  | CustomC Identifier -- The custom type

instance showConceptType :: Show ConceptType where
  show StringC = "string"
  show MeasureC = "measure"
  show BooleanC = "boolean"
  show IntervalC = "interval"
  show EntityDomainC = "entity_domain"
  show EntitySetC = "enitty_set"
  show RoleC = "role"
  show CompositeC = "composite"
  show TimeC = "time"
  show (CustomC x) = show x

derive instance eqConceptType :: Eq ConceptType

-- | parse concept type from string
parseConceptType :: String -> V Issues ConceptType
parseConceptType x = ado
  cid <- Id.parseId x
  let
    res = case toString $ unwrap cid of
      "string" -> StringC
      "meaeure" -> MeasureC
      "bollean" -> BooleanC
      "interval" -> IntervalC
      "entity_domain" -> EntityDomainC
      "entity_set" -> EntitySetC
      "role" -> RoleC
      "composite" -> CompositeC
      "time" -> TimeC
      _ -> CustomC cid
  in res

-- | reversed keywords which can not used as concept id
reversedConcepts :: Array String
reversedConcepts = [ "concept", "concept_type" ]

-- | create concept
concept :: Identifier -> ConceptType -> Props -> Concept
concept conceptId conceptType props = Concept { conceptId, conceptType, props, _info }
  where
  _info = Nothing

-- TODO: add a function that can add hidden props
setInfo :: (Maybe ItemInfo) -> Concept -> Concept
setInfo info (Concept c) = Concept (c { _info = info })

-- | The unvalidated concept record.
type ConceptInput =
  { conceptId :: String
  , conceptType :: String
  , props :: Map Identifier String
  , _info :: Maybe ItemInfo
  }

-- | get concept id
getId :: Concept -> Identifier
getId (Concept x) = x.conceptId

-- | some concept type require a column exists
-- for example if concept type is entity_set, then it
-- must have non empty domain.
checkMandatoryField :: Concept -> V Issues Concept
checkMandatoryField input@(Concept c) = case c.conceptType of
  EntitySetC -> ado
    hasFieldAndGetValue "domain" c.props
      `andThen`
        nonEmptyField "domain"
    in input
  _ -> pure input

hasFieldAndGetValue :: String -> Props -> V Issues String
hasFieldAndGetValue field input =
  case M.lookup (Id.unsafeCreate field) input of
    Nothing -> invalid [ Issue $ "field " <> field <> " MUST exist for concept" ]
    Just v -> pure v

nonEmptyField :: String -> String -> V Issues String
nonEmptyField field input =
  if Str.null input then
    invalid [ Issue $ "field " <> field <> " MUST not be empty" ]
  else
    pure input

hasProp :: String -> Props -> Boolean
hasProp f props = M.member (Id.unsafeCreate f) props

-- | WS server have issue when concept Id is too long
conceptIdTooLong :: Concept -> V Issues Concept
conceptIdTooLong conc@(Concept c) = ado
  Id.isLongerThan64Chars c.conceptId
  in
    conc

-- | check if concept id is not reversed keyword
notReversed :: String -> V Issues String
notReversed conceptId =
  if conceptId `elem` reversedConcepts then
    invalid [ Issue $ "concept/concept_type can not be used as concept id" ]
  else
    pure conceptId

-- | convert a ConceptInput into valid Concept or errors
parseConcept :: ConceptInput -> V Issues Concept
parseConcept input =
  let
    conceptId = notReversed input.conceptId
      `andThen` Id.parseId
    conceptType = parseConceptType input.conceptType

  in
    (concept <$> conceptId <*> conceptType <*> pure input.props)
      `andThen`
        checkMandatoryField
      `andThen`
        (\c -> pure $ setInfo input._info c)

-- | unsafe create, useful for testing.
unsafeCreate :: String -> String -> Map String String -> ItemInfo -> Concept
unsafeCreate concept_id concept_type props_ info =
  Concept
    { conceptId: conceptId
    , conceptType: conceptType
    , props: props
    , _info: Just info
    }
  where
  conceptId = Id.unsafeCreate concept_id
  conceptType = unsafeCreateConceptType concept_type
  props = mapKeys Id.unsafeCreate props_

unsafeCreateConceptType :: String -> ConceptType
unsafeCreateConceptType x =
  case x of
    "string" -> StringC
    "meaeure" -> MeasureC
    "bollean" -> BooleanC
    "interval" -> IntervalC
    "entity_domain" -> EntityDomainC
    "entity_set" -> EntitySetC
    "role" -> RoleC
    "composite" -> CompositeC
    "time" -> TimeC
    _ -> CustomC $ Id.unsafeCreate x

-- TODO: create validation in which will check discrete/continuous concepts files.
-- conceptInputFromCsvRecAndFileInfo :: FileInfo -> CsvRec -> V Issues ConceptInput
