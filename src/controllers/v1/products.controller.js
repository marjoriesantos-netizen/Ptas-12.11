import { toProductDTO } from "../../dtos/product.dto.js";
import { ProductsService } from "../../services/products.service.js";

export const listar = async (req, res, next) => {
  try {
    const products = await ProductsService.listar();
    res.status(200).json(products.map(toProductDTO));
  } catch (error) {
    next(error);
  }
};

export const buscarPorId = async (req, res, next) => {
  try {
    const product = await ProductsService.buscarPorId(req.params.id);
    res.status(200).json(toProductDTO(product));
  } catch (error) {
    next(error);
  }
};

export const criar = async (req, res, next) => {
  try {
    const product = await ProductsService.criar(req.body);
    res.status(201).json(toProductDTO(product));
  } catch (error) {
    next(error);
  }
};

export const atualizar = async (req, res, next) => {
  try {
    const product = await ProductsService.atualizar(req.params.id, req.body);
    res.status(200).json(toProductDTO(product));
  } catch (error) {
    next(error);
  }
};

export const remover = async (req, res, next) => {
  try {
    await ProductsService.remover(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
