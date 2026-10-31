import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ collection: 'grammar_lessons', timestamps: true })
export class GrammarLesson {
  @Prop({ required: true, unique: true, trim: true })
  slug!: string;

  @Prop({ required: true })
  title!: string;

  @Prop({ default: 0, index: true })
  order!: number;

  @Prop({ type: Number, default: null, index: true })
  grade!: number | null; // 10 | 11 | 12

  @Prop({ type: String, default: null })
  topic!: string | null;

  @Prop({ type: String, default: null })
  summary!: string | null;

  @Prop({ required: true })
  content!: string; // nội dung Markdown

  @Prop({ default: false })
  isPublished!: boolean;
}

export type GrammarLessonDocument = HydratedDocument<GrammarLesson>;
export const GrammarLessonSchema = SchemaFactory.createForClass(GrammarLesson);
