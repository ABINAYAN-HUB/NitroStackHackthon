import { McpApp, Module, ConfigModule } from '@nitrostack/core';
import { DocumentsModule } from './modules/documents/documents.module.js';
import { RegistryModule } from './modules/registry/registry.module.js';
import { AddressModule } from './modules/address/address.module.js';
import { WebPresenceModule } from './modules/web-presence/web-presence.module.js';
import { ScoringModule } from './modules/scoring/scoring.module.js';
import { CaseStoreModule } from './modules/case-store/case-store.module.js';
import { FraudNetworkModule } from './modules/fraud-network/fraud-network.module.js';

/**
 * Root Application Module — GeoTrust AI
 *
 * Business authenticity investigation engine.
 * Five tool modules + shared CaseStore state.
 */
@McpApp({
    module: AppModule,
    server: {
        name: 'geotrust-ai',
        version: '1.0.0'
    },
    logging: {
        level: 'info'
    }
})
@Module({
    name: 'geotrust-ai',
    description: 'Business authenticity investigation for SME loan onboarding',
    imports: [
        CaseStoreModule,
        DocumentsModule,
        RegistryModule,
        AddressModule,
        WebPresenceModule,
        ScoringModule,
        FraudNetworkModule
    ],
    providers: [
        { provide: 'OAUTH_CONFIG', useValue: { resourceUri: 'http://localhost' } }
    ]
})
export class AppModule { }
