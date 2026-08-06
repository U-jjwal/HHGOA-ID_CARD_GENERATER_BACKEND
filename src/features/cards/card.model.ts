import { Schema, model, Document } from 'mongoose';

export type CardFormat = 'pfp-frame' | 'builder-id';

export interface ICard extends Document {
  cardId: string;
  format: CardFormat;
  imageUrl: string;
  cloudinaryPublicId: string;
  name?: string;
  teamName?: string;
  role?: string;
  builderTitle?: string;
  createdAt: Date;
  viewCount: number;
}

const cardSchema = new Schema<ICard>(
  {
    cardId: { type: String, required: true, unique: true, index: true },
    format: { type: String, enum: ['pfp-frame', 'builder-id'], required: true },
    imageUrl: { type: String, required: true },
    cloudinaryPublicId: { type: String, required: true },
    name: { type: String, maxlength: 60, trim: true },
    teamName: { type: String, maxlength: 60, trim: true },
    role: { type: String, maxlength: 60, trim: true },
    builderTitle: { type: String, maxlength: 80, trim: true },
    viewCount: { type: Number, default: 0 },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

export const Card = model<ICard>('Card', cardSchema);
