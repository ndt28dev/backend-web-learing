import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type RoleDocument = Role & Document;

@Schema({ timestamps: true })
export class Role {
  @Prop({ required: true, unique: true, trim: true })
  code!: string;

  @Prop({ required: true, trim: true })
  name!: string;

  @Prop()
  description!: string;

  @Prop({ default: false })
  is_system!: boolean;
}

export const RoleSchema = SchemaFactory.createForClass(Role);
