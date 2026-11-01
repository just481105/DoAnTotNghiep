import { Controller, Get, Param, Query } from '@nestjs/common';
import { GrammarService } from './grammar.service';

@Controller('grammar')
export class GrammarController {
  constructor(private readonly grammarService: GrammarService) {}

  @Get()
  async findAll(
    @Query('grade') grade?: string,
    @Query('topic') topic?: string,
    @Query('q') q?: string,
  ) {
    return this.grammarService.findAll({ grade, topic, q });
  }

  @Get(':slug')
  async findOne(@Param('slug') slug: string) {
    return this.grammarService.findBySlug(slug);
  }
}
