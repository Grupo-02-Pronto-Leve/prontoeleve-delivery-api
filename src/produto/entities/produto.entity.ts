import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Categoria } from '../../categoria/entities/categoria.entity';
import { Usuario } from './../../usuario/entities/usuario.entity';
import { IsNotEmpty } from 'class-validator';

@Entity({ name: 'tb_produto' })
export class Produto {
  @PrimaryGeneratedColumn()
  id: number;

  @IsNotEmpty()
  @Column({ length: 100, nullable: false })
  nome: string;

  @IsNotEmpty()
  @Column({ length: 1000, nullable: false })
  descricao: string;

  @IsNotEmpty()
  @Column('decimal', { precision: 10, scale: 2 })
  preco: number;

  @Column({ type: 'boolean', default: true })
  disponivel: boolean;

  @Column({ length: 255, nullable: true })
  foto: string;

  @ManyToOne(() => Categoria, (categoria) => categoria.produto, {
    onDelete: 'CASCADE',
  })
  categoria: Categoria;

  @ManyToOne(() => Usuario, (usuario) => usuario.produto, {
    onDelete: 'CASCADE',
  })
  usuario: Usuario;
}
