-- CreateEnum
CREATE TYPE "FonteLeitura" AS ENUM ('MANUAL', 'OPEN_METEO');

-- CreateEnum
CREATE TYPE "TipoLeitura" AS ENUM ('OBSERVADA', 'PREVISTA');

-- CreateEnum
CREATE TYPE "NivelRisco" AS ENUM ('BAIXO', 'MODERADO', 'ALTO', 'CRITICO');

-- CreateTable
CREATE TABLE "Produtor" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefone" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Produtor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Propriedade" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "municipio" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "altitude" INTEGER,
    "produtorId" INTEGER NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Propriedade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cultura" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "temperaturaCritica" DOUBLE PRECISION NOT NULL,
    "estagioSensivel" TEXT NOT NULL,
    "descricao" TEXT,

    CONSTRAINT "Cultura_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Plantio" (
    "id" SERIAL NOT NULL,
    "areaHectares" DOUBLE PRECISION NOT NULL,
    "dataPlantio" TIMESTAMP(3),
    "propriedadeId" INTEGER NOT NULL,
    "culturaId" INTEGER NOT NULL,

    CONSTRAINT "Plantio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeituraClima" (
    "id" SERIAL NOT NULL,
    "dataHora" TIMESTAMP(3) NOT NULL,
    "temperatura" DOUBLE PRECISION NOT NULL,
    "umidade" DOUBLE PRECISION,
    "velocidadeVento" DOUBLE PRECISION,
    "coberturaNuvens" DOUBLE PRECISION,
    "fonte" "FonteLeitura" NOT NULL DEFAULT 'MANUAL',
    "tipo" "TipoLeitura" NOT NULL DEFAULT 'OBSERVADA',
    "propriedadeId" INTEGER NOT NULL,

    CONSTRAINT "LeituraClima_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Alerta" (
    "id" SERIAL NOT NULL,
    "dataReferencia" TIMESTAMP(3) NOT NULL,
    "temperaturaMin" DOUBLE PRECISION NOT NULL,
    "nivel" "NivelRisco" NOT NULL,
    "mensagem" TEXT NOT NULL,
    "lido" BOOLEAN NOT NULL DEFAULT false,
    "plantioId" INTEGER NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Alerta_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Produtor_email_key" ON "Produtor"("email");

-- CreateIndex
CREATE INDEX "Propriedade_produtorId_idx" ON "Propriedade"("produtorId");

-- CreateIndex
CREATE UNIQUE INDEX "Cultura_nome_key" ON "Cultura"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "Plantio_propriedadeId_culturaId_key" ON "Plantio"("propriedadeId", "culturaId");

-- CreateIndex
CREATE INDEX "LeituraClima_propriedadeId_dataHora_idx" ON "LeituraClima"("propriedadeId", "dataHora");

-- CreateIndex
CREATE UNIQUE INDEX "LeituraClima_propriedadeId_dataHora_tipo_key" ON "LeituraClima"("propriedadeId", "dataHora", "tipo");

-- CreateIndex
CREATE INDEX "Alerta_nivel_lido_idx" ON "Alerta"("nivel", "lido");

-- CreateIndex
CREATE UNIQUE INDEX "Alerta_plantioId_dataReferencia_key" ON "Alerta"("plantioId", "dataReferencia");

-- AddForeignKey
ALTER TABLE "Propriedade" ADD CONSTRAINT "Propriedade_produtorId_fkey" FOREIGN KEY ("produtorId") REFERENCES "Produtor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Plantio" ADD CONSTRAINT "Plantio_propriedadeId_fkey" FOREIGN KEY ("propriedadeId") REFERENCES "Propriedade"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Plantio" ADD CONSTRAINT "Plantio_culturaId_fkey" FOREIGN KEY ("culturaId") REFERENCES "Cultura"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeituraClima" ADD CONSTRAINT "LeituraClima_propriedadeId_fkey" FOREIGN KEY ("propriedadeId") REFERENCES "Propriedade"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alerta" ADD CONSTRAINT "Alerta_plantioId_fkey" FOREIGN KEY ("plantioId") REFERENCES "Plantio"("id") ON DELETE CASCADE ON UPDATE CASCADE;
