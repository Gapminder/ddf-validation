module Data.DDF.Entity where

import Prelude

import Data.Array.NonEmpty as Narr
import Data.DDF.Atoms.Boolean (parseBoolean)
import Data.DDF.Csv.CsvFile (CsvRowRec)
import Data.DDF.Csv.FileInfo as FI
import Data.DDF.Atoms.Identifier (Identifier)
import Data.DDF.Atoms.Identifier as Id
import Data.Validation.Issue (Issue(..), Issues)
import Data.List (List(..))
import Data.List as L
import Data.Map (Map)
import Data.Map as M
import Data.Maybe (Maybe(..), fromJust)
import Data.Newtype (unwrap)
import Data.String (Pattern(..))
import Data.String as Str
import Data.String.NonEmpty.Internal (NonEmptyString(..), stripPrefix, toString)
import Data.String.Utils (startsWith)
import Data.Traversable (sequence)
import Data.Tuple (Tuple(..))
import Data.Tuple as T
import Data.Validation.Semigroup (V, invalid, isValid)
import Partial.Unsafe (unsafePartial)
import Safe.Coerce (coerce)
import Data.DDF.Atoms.Header (Header(..), header, headerVal)

-- | Entity type.
-- Entity MUST have id, entity_domain.
-- Entity MAY have entity_set, which can have multiple values
data Entity = Entity
  { entityId :: Identifier
  , entityDomain :: Identifier
  , entitySets :: List Identifier
  , props :: Props
  , _info :: Map String String
  }

instance eqEntity :: Eq Entity where
  eq (Entity a) (Entity b) = (a.entityId == b.entityId) && (a.entityDomain == b.entityDomain)

instance showEntity :: Show Entity where
  show (Entity x) = show x

-- | Properties type
type Props = Map Identifier String

entity :: Identifier -> Identifier -> List Identifier -> Props -> Entity
entity entityId entityDomain entitySets props = Entity { entityId, entityDomain, entitySets, props, _info }
  where
  _info = M.empty

getId :: Entity -> Identifier
getId (Entity e) = e.entityId

getDomain :: Entity -> Identifier
getDomain (Entity e) = e.entityDomain

getDomainAndId :: Entity -> Tuple Identifier Identifier
getDomainAndId (Entity e) = Tuple e.entityId e.entityDomain

-- | Entity input from CsvFile
-- The entityDomain and entitySet field comes from file name, so they are already nonempty
-- entitySet might be absent.
type EntityInput =
  { entityId :: String
  , entityDomain :: NonEmptyString
  , entitySet :: Maybe NonEmptyString
  , props :: Map Header String
  , _info :: Map String String
  }

validEntityId :: String -> V Issues Identifier
validEntityId s = Id.parseId s

-- because entity domain and entity set are validated in early processes
-- no need to do more things.
validEntityDomainId :: NonEmptyString -> V Issues Identifier
validEntityDomainId = pure <<< coerce

validEntitySetId :: NonEmptyString -> V Issues Identifier
validEntitySetId = pure <<< coerce

-- | split entity properties input, separate is--entity_set header and others
splitEntAndProps :: Map Header String -> Tuple (List (Tuple Identifier String)) (List (Tuple Identifier String))
splitEntAndProps props =
  let
    isIsHeader (Tuple header _) =
      let
        headerStr = headerVal header
      in
        case stripPrefix (Pattern "is--") headerStr of
          Nothing -> false
          Just _ -> true

    isHeaderToIdentifier header = Id.unsafeCreate $ Str.drop 4 $ toString $ headerVal header

    headerToIdentifier header = Id.unsafeCreate $ toString $ headerVal header

    { yes, no } = L.partition isIsHeader $ M.toUnfoldableUnordered props

    yes_ = map (\(Tuple h v) -> Tuple (isHeaderToIdentifier h) v) yes

    no_ = map (\(Tuple h v) -> Tuple (headerToIdentifier h) v) no
  in
    Tuple yes_ no_

getEntitySets :: List (Tuple Identifier String) -> V Issues (List Identifier)
getEntitySets lst = entitySetWithTureValue
  where
  entitySetWithTureValue = sequence $ map collectTrueItem lst

  collectTrueItem (Tuple header value) =
    let
      boolValue = parseBoolean value

      headerStr = toString $ unwrap header
    in
      if isValid boolValue then
        pure header
      else
        invalid [ Issue $ "invalid boolean value for " <> headerStr <> ": " <> value ]

parseEntity :: EntityInput -> V Issues Entity
parseEntity { entityId: eid, entityDomain: edm, entitySet: es, props: props } =
  if Str.null eid then
    -- TODO: specify which column should have value
    invalid [ Issue $ "entity MUST have an entity id" ]
  else
    let
      validEid = validEntityId eid
      validEdomain = validEntityDomainId edm
      Tuple esets propsLst = splitEntAndProps props
      -- FIXME: compare the sets and set in `es` in input
      validEsets = getEntitySets esets
      propsMinusIsHeaders = M.fromFoldable propsLst
    in
      entity
        <$> validEid
        <*> validEdomain
        <*> validEsets
        <*> (pure propsMinusIsHeaders)

entityInputFromCsvRecAndFileInfo :: FI.Ent -> CsvRowRec -> V Issues EntityInput
entityInputFromCsvRecAndFileInfo { domain, set } (Tuple headers row) =
  let
    propsMap = M.fromFoldable $ Narr.zip headers row

    entityCol = case set of
      Nothing -> Header domain
      Just s ->
        if (Header s) `Narr.elem` headers then
          Header s
        else
          Header domain
    -- TODO: validate if entitySet from file name matches
    Tuple eid props = unsafePartial $ fromJust $ M.pop entityCol propsMap

  in
    pure { entityId: eid
         , entityDomain: domain
         , entitySet: set
         , props: props
         , _info: M.empty  -- TODO: add additional infos about the entity.
         }
