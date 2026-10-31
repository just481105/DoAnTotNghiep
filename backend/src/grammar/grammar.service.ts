import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { GrammarLesson, GrammarLessonDocument } from './grammar.schema';

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

@Injectable()
export class GrammarService {
  constructor(
    @InjectModel(GrammarLesson.name)
    private readonly model: Model<GrammarLessonDocument>,
  ) {}

  private toDto(l: Record<string, any>, withContent = false) {
    const dto = {
      id: String(l._id),
      slug: l.slug,
      title: l.title,
      order: l.order,
      grade: l.grade ?? null,
      topic: l.topic ?? null,
      summary: l.summary ?? null,
      updatedAt: l.updatedAt,
    };
    return withContent ? { ...dto, content: l.content } : dto;
  }

  // Danh sách bài (không kèm nội dung để nhẹ)
  async findAll(filters: { grade?: unknown; topic?: unknown; q?: unknown }) {
    const where: FilterQuery<GrammarLessonDocument> = { isPublished: true };

    // chỉ nhận kiểu chuỗi để tránh bị chèn toán tử Mongo qua query string
    if (typeof filters.grade === 'string') {
      const g = Number(filters.grade);
      if (Number.isInteger(g)) where.grade = g;
    }
    if (typeof filters.topic === 'string' && filters.topic) {
      where.topic = filters.topic;
    }
    if (typeof filters.q === 'string' && filters.q.trim()) {
      where.title = { $regex: escapeRegex(filters.q.trim()), $options: 'i' };
    }

    const rows = await this.model
      .find(where)
      .select('-content')
      .sort({ grade: 1, order: 1, createdAt: 1 })
      .lean();

    return rows.map((r: Record<string, any>) => this.toDto(r));
  }

  // Chi tiết một bài theo slug (kèm nội dung Markdown)
  async findBySlug(slug: string) {
    const lesson = await this.model.findOne({ slug, isPublished: true }).lean();
    if (!lesson) throw new NotFoundException('Không tìm thấy bài học');
    return this.toDto(lesson, true);
  }
}
