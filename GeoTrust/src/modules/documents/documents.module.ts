import { Module } from '@nitrostack/core';
import { DocumentsTools } from './documents.tools.js';
import { CaseStoreModule } from '../case-store/case-store.module.js';

@Module({
    name: 'documents',
    description: 'Document extraction — OCR and claim parsing from uploaded business documents',
    imports: [CaseStoreModule],
    controllers: [DocumentsTools],
})
export class DocumentsModule { }
