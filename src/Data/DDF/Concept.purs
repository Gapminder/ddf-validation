module Data.DDF.Concept where

import Prelude

import Data.Array as A
import Data.Array.NonEmpty (NonEmptyArray)
import Data.Array.NonEmpty as Narr
import Data.Csv (CsvRow(..))
import Data.DDF.Csv.CsvFile (CsvRowRec, headersExists, parseCsvRowRec)
import Data.DDF.Csv.FileInfo (FileInfo(..))
import Data.DDF.Csv.FileInfo as FI
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
import Data.Newtype (unwrap)
import Data.String as Str
import Data.String.NonEmpty.Internal (NonEmptyString(..), toString)
import Data.Traversable (for, traverse)
import Data.Tuple (Tuple(..), fst)
import Data.Validation.Semigroup
import Data.Validation.Semigroup (V, invalid)
import Safe.Coerce (coerce)
import Data.DDF.Atoms.Header (parseHeader, createHeader, Header(..), headerVal)

-- | Each Concept MUST have an Id and concept type.
-- Other properties is a Map
data Concept = Concept
  { conceptId :: Identifier
  , conceptType :: ConceptType
  , props :: Props
  , _info :: Map String String -- additional information used in the app, not in DDF data model
  }

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

-- | create concept
concept :: Identifier -> ConceptType -> Props -> Concept
concept conceptId conceptType props = Concept { conceptId, conceptType, props, _info }
  where
  _info = M.empty

-- TODO: add a function that can add hidden props

instance showConcept :: Show Concept where
  show (Concept x) = show x

instance eqConcept :: Eq Concept where
  eq (Concept a) (Concept b) = a.conceptId == b.conceptId

-- | Concept Input, which comes from one row of CsvFile, is a Map.
type ConceptInput = Map Identifier String

-- FIXME: Concept Input should be consistent with Entity Input
-- which use a record as type and content shoud be same as Concept.
-- type ConceptInput = { conceptId :: String
--                     , conceptType :: String
--                     , props :: Map Identifier String }

-- | get concept id
getId :: Concept -> Identifier
getId (Concept x) = x.conceptId

hasProp :: String -> Props -> Boolean
hasProp f props = M.member (Id.unsafeCreate f) props

hasFieldAndGetValue :: String -> ConceptInput -> V Issues String
hasFieldAndGetValue field input = case M.lookup (Id.unsafeCreate field) input of
  Nothing -> invalid [ Issue $ "field " <> field <> " MUST exist for concept" ]
  Just v -> pure v

nonEmptyField :: String -> String -> V Issues String
nonEmptyField field input =
  if Str.null input then
    invalid [ Issue $ "field " <> field <> " MUST not be empty" ]
  else
    pure input

checkMandatoryField :: Concept -> V Issues Concept
checkMandatoryField input@(Concept c) = case c.conceptType of
  EntitySetC -> ado
    hasFieldAndGetValue "domain" c.props
      `andThen`
        nonEmptyField "domain"
    in input
  _ -> pure input

-- | WS server have issue when concept Id is too long
conceptIdTooLong :: Concept -> V Issues Concept
conceptIdTooLong conc@(Concept c) = ado
  Id.isLongerThan64Chars c.conceptId
  in
    conc

-- | convert a ConceptInput into valid Concept or errors
parseConcept :: ConceptInput -> V Issues Concept
parseConcept input =
  let
    conceptId =
      hasFieldAndGetValue "concept" input
        `andThen`
          nonEmptyField "concept"
        `andThen`
          Id.parseId

    conceptType =
      hasFieldAndGetValue "concept_type" input
        `andThen`
          nonEmptyField "concept_type"
        `andThen`
          parseConceptType

    props = input # (M.delete (Id.unsafeCreate "concept") >>> M.delete (Id.unsafeCreate "concept_type"))
  in
    (concept <$> conceptId <*> conceptType <*> pure props)
      `andThen`
        checkMandatoryField

-- | convert CsvRec to ConceptInput
conceptInputFromCsvRec :: CsvRowRec -> ConceptInput
conceptInputFromCsvRec (Tuple headers row) = rowAsMap row
  where
  headersL = map coerce headers

  rowAsMap r = fromFoldable (Narr.zip headersL r)

-- | create ConceptInput from csv row
parseCsvRowRecConceptInput :: NonEmptyArray Header -> CsvRow -> V Issues Concept
parseCsvRowRecConceptInput headers row =
  parseCsvRowRec headers row
    `andThen`
      (\x -> pure $ conceptInputFromCsvRec x)
    `andThen`
      parseConcept

-- | unsafe create, useful for testing.
unsafeCreate :: String -> String -> Map String String -> Map String String -> Concept
unsafeCreate concept_id concept_type props_ info =
  Concept
    { conceptId: conceptId
    , conceptType: conceptType
    , props: props
    , _info: info
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
