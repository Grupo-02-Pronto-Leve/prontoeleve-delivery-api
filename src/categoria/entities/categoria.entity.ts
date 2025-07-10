import { IsNotEmpty } from 'class-validator';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Produto } from 'src/produto/entities/produto.entity';
// import { ApiProperty } from '@nestjs/swagger';

@Entity({ name: 'tb_categorias' })
export class Categoria {
  @PrimaryGeneratedColumn()
  // @ApiProperty()
  id: number;

  @IsNotEmpty()
  @Column({ length: 255, nullable: false })
  // @ApiProperty()
  nome: string;

  @IsNotEmpty()
  @Column({ length: 255, nullable: false })
  // @ApiProperty()
  descricao: string;

  // @ApiProperty()
  @OneToMany(() => Produto, (produto) => produto.categoria)
  produtos: Produto[];
}
