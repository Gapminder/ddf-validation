module Data.DDF.Concept where

import Data.Validation.Semigroup
import Prelude

import Data.Array as A
import Data.Array.NonEmpty (NonEmptyArray)
import Data.Array.NonEmpty as Narr
import Data.Csv (CsvRow(..))
import Data.DDF.CsvFile (CsvRec, Header(..), headersExists, validCsvRec)
import Data.DDF.FileInfo (FileInfo(..))
import Data.DDF.Identifier (Identifier)
import Data.DDF.Identifier as Id
import Data.DDF.Validation.Result (Errors, Error(..))
import Data.DDF.Validation.Result as Res
import Data.DDF.Validation.ValidationT (Validation, vError, vWarning)
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
import Data.Validation.Semigroup (V, invalid)
import Safe.Coerce (coerce)

-- | Types of concepts
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

parseConceptType :: String -> V Errors ConceptType
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

-- | Each Concept should have an Id and concept type.
-- | Other properties will be a dictionary
data Concept
  = Concept
    { conceptId :: Identifier
    , conceptType :: ConceptType
    , props :: Props
    }

-- | Properties type
type Props
  = Map Identifier String

-- | create concept
concept :: Identifier -> ConceptType -> Props -> Concept
concept conceptId conceptType props = Concept { conceptId, conceptType, props }

instance showConcept :: Show Concept where
  show (Concept x) = show x

instance eqConcept :: Eq Concept where
  eq (Concept a) (Concept b) = a.conceptId == b.conceptId

getId :: Concept -> Identifier
getId (Concept x) = x.conceptId

-- | Concept Input, which comes from CsvFile.
-- | if CsvFile is valid, then every concept should have conceptId and conceptType.
type ConceptInput
  = Map Identifier String

hasProp :: String -> Props -> Boolean
hasProp f props = M.member (Id.unsafeCreate f) props

hasFieldAndGetValue :: String -> ConceptInput -> V Errors String
hasFieldAndGetValue field input = case M.lookup (Id.unsafeCreate field) input of
  Nothing -> invalid [ Error $ "field " <> field <> "MUST exist for concept" ]
  Just v -> pure v

nonEmptyField :: String -> String -> V Errors String
nonEmptyField field input =
  if Str.null input then
    invalid [ Error $ "field " <> field <> " MUST not be empty" ]
  else
    pure input

checkMandatoryField :: Concept -> V Errors Concept
checkMandatoryField input@(Concept c) = case c.conceptType of
  EntitySetC -> ado
    hasFieldAndGetValue "domain" c.props
      `andThen`
        nonEmptyField "domain"
    in input
  _ -> pure input

-- | WS server have issue when concept Id is too long
conceptIdTooLong :: Concept -> V Errors Concept
conceptIdTooLong conc@(Concept c) = ado
  Id.isLongerThan64Chars c.conceptId
  in 
    conc

-- | convert a ConceptInput into valid Concept or errors
parseConcept :: ConceptInput -> V Errors Concept
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
conceptInputFromCsvRec :: CsvRec -> ConceptInput
conceptInputFromCsvRec (Tuple headers row) = rowAsMap row
  where
  headersL = map coerce headers

  rowAsMap r = fromFoldable (Narr.zip headersL r)
