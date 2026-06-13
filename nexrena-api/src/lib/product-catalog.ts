/** Re-exports — canonical catalog lives in service-catalog/ */
export {
  SERVICE_CATALOG,
  PRODUCT_CATALOG,
  CATEGORY_ORDER,
  getCatalogService,
  getCatalogProduct,
  listCatalogServices,
  listCatalogProducts,
  catalogServiceForClient,
  catalogProductForClient,
  UNIVERSAL_SCOPE_LANGUAGE,
  PUBLIC_CATEGORY_SUMMARY,
  type CatalogService,
  type CatalogProduct,
  type ServiceCategory,
  type ServiceTier,
} from './service-catalog'
