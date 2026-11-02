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
  grade!: number | null;

  @Prop({ type: String, default: null })
  topic!: string | null;

  @Prop({ type: String, default: null })
  summary!: string | null;

  @Prop({ required: true })
  content!: string;

  @Prop({ default: false })
  isPublished!: boolean;
}

export type GrammarLessonDocument = HydratedDocument<GrammarLesson>;
export const GrammarLessonSchema = SchemaFactory.createForClass(GrammarLesson);
