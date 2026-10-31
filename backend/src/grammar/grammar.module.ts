import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GrammarController } from './grammar.controller';
import { GrammarService } from './grammar.service';
import { GrammarLesson, GrammarLessonSchema } from './grammar.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: GrammarLesson.name, schema: GrammarLessonSchema },
    ]),
  ],
  controllers: [GrammarController],
  providers: [GrammarService],
})
export class GrammarModule {}
