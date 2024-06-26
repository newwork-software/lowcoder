package org.lowcoder.sdk.plugin.common;

import org.lowcoder.sdk.exception.BizException;
import org.lowcoder.sdk.exception.PluginCommonError;
import org.lowcoder.sdk.exception.PluginException;
import org.lowcoder.sdk.models.DatasourceConnectionConfig;
import org.lowcoder.sdk.models.DatasourceStructure;
import org.lowcoder.sdk.models.QueryExecutionResult;
import org.lowcoder.sdk.query.QueryExecutionContext;
import org.lowcoder.sdk.query.QueryVisitorContext;
import org.lowcoder.sdk.util.ExceptionUtils;
import org.pf4j.ExtensionPoint;
import reactor.core.publisher.Mono;

import java.util.Map;

import static org.lowcoder.sdk.exception.PluginCommonError.QUERY_EXECUTION_ERROR;
import static org.lowcoder.sdk.util.ExceptionUtils.*;

/**
 * will be set to an abstract class later
 */
public interface QueryExecutor<ConnectionConfig extends DatasourceConnectionConfig, Connection, QueryContext extends QueryExecutionContext>
        extends ExtensionPoint {

    /**
     * should use {@link #buildQueryExecutionContextMono} instead
     */
    @Deprecated(forRemoval = true)
    @SuppressWarnings("unchecked")
    default QueryContext doBuildQueryExecutionContext(DatasourceConnectionConfig datasourceConnectionConfig, Map<String, Object> queryConfig,
            Map<String, Object> requestParams, QueryVisitorContext queryVisitorContext) {
        ConnectionConfig connectionConfig;
        try {
            connectionConfig = (ConnectionConfig) datasourceConnectionConfig;
        } catch (ClassCastException e) {
            throw ofPluginException(PluginCommonError.INVALID_QUERY_SETTINGS, "INVALID_QUERY_SETTINGS", e.getMessage());
        }

        try {
            return buildQueryExecutionContext(connectionConfig, queryConfig, requestParams, queryVisitorContext);
        } catch (Exception e) {
            throw ExceptionUtils.wrapException(PluginCommonError.INVALID_QUERY_SETTINGS, "QUERY_ARGUMENT_ERROR", e);
        }
    }

    @SuppressWarnings("unchecked")
    default Mono<QueryContext> buildQueryExecutionContextMono(DatasourceConnectionConfig datasourceConnectionConfig,
            Map<String, Object> queryConfig,
            Map<String, Object> requestParams, QueryVisitorContext queryVisitorContext) {
        ConnectionConfig connectionConfig;
        try {
            connectionConfig = (ConnectionConfig) datasourceConnectionConfig;
        } catch (ClassCastException e) {
            return propagateError(PluginCommonError.INVALID_QUERY_SETTINGS, "INVALID_QUERY_SETTINGS", e);
        }

        return doBuildQueryExecutionContextMono(connectionConfig, queryConfig, requestParams, queryVisitorContext);
    }

    /**
     * We'll call JS to do server-side parsing and mustache {{ }} handling in the future,
     * plugins should override this method to return a Mono<QueryContext>
     */
    @SuppressWarnings("unchecked")
    default Mono<QueryContext> doBuildQueryExecutionContextMono(ConnectionConfig connectionConfig,
            Map<String, Object> queryConfig,
            Map<String, Object> requestParams, QueryVisitorContext queryVisitorContext) {
        return Mono.fromSupplier(() -> buildQueryExecutionContext(connectionConfig, queryConfig, requestParams, queryVisitorContext))
                .onErrorMap(e -> ExceptionUtils.wrapException(PluginCommonError.INVALID_QUERY_SETTINGS, "QUERY_ARGUMENT_ERROR", e));
    }

    /**
     * should not override this method!
     */
    @SuppressWarnings("unchecked")
    default Mono<QueryExecutionResult> doExecuteQuery(Connection connection, QueryExecutionContext queryExecutionContext) {
        QueryContext context;
        try {
            context = (QueryContext) queryExecutionContext;
        } catch (ClassCastException e) {
            return ofPluginError(PluginCommonError.INVALID_QUERY_SETTINGS, "INVALID_QUERY_SETTINGS", e.getMessage());
        }

        return executeQuery(connection, context)
                .onErrorMap(e -> {
                    if (e instanceof PluginException || e instanceof BizException) {
                        return e;
                    }
                    return new PluginException(QUERY_EXECUTION_ERROR, "QUERY_EXECUTION_ERROR", e.getMessage());
                });
    }

    /**
     * supported in SQL-like datasources
     * <p>
     * should not override this method!
     */
    @SuppressWarnings("unchecked")
    default Mono<DatasourceStructure> doGetStructure(Connection connection, DatasourceConnectionConfig datasourceConnectionConfig) {
        ConnectionConfig connectionConfig;
        try {
            connectionConfig = (ConnectionConfig) datasourceConnectionConfig;
        } catch (ClassCastException e) {
            throw ofPluginException(PluginCommonError.INVALID_QUERY_SETTINGS, "DATASOURCE_GET_STRUCTURE_ERROR", e.getMessage());
        }
        return getStructure(connection, connectionConfig)
                .onErrorMap(e -> {
                    if (e instanceof PluginException) {
                        return e;
                    }
                    return new PluginException(QUERY_EXECUTION_ERROR, "DATASOURCE_GET_STRUCTURE_ERROR", e.getMessage());
                });
    }

    default Mono<DatasourceStructure> getStructure(Connection connection, ConnectionConfig connectionConfig) {
        return Mono.empty();
    }

    default Map<String, Object> sanitizeQueryConfig(Map<String, Object> queryConfig) {
        return queryConfig;
    }

    /**
     * We'll call JS to do server-side parsing and mustache {{ }} handling in the future, so this blocking call should be removed
     */
    @Deprecated(forRemoval = true)
    QueryContext buildQueryExecutionContext(ConnectionConfig datasourceConfig, Map<String, Object> queryConfig,
            Map<String, Object> requestParams, QueryVisitorContext queryVisitorContext);

    Mono<QueryExecutionResult> executeQuery(Connection connection, QueryContext queryExecutionContext);

}
