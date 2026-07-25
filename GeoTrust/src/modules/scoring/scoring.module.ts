import { Module } from '@nitrostack/core';
import { ScoringTools } from './scoring.tools.js';
import { CaseStoreModule } from '../case-store/case-store.module.js';

@Module({
    name: 'scoring',
    description: 'Case scoring — computes dimension scores, overall confidence, recommendation, and missing evidence checklist from accumulated CaseState',
    imports: [CaseStoreModule],
    controllers: [ScoringTools],
})
export class ScoringModule { }
